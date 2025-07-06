from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import qrcode
import io
import os
import uuid

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
db = SQLAlchemy(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'standard' or 'fabric'
    quantity = db.Column(db.Float, nullable=False)   # integer for standard, float for fabric (meters)
    image = db.Column(db.String(200))
with app.app_context():
    db.create_all()

@app.route('/product', methods=['POST'])
def create_product():
    data = request.form
    image_file = request.files.get('image')
    image_url = None
    if image_file and image_file.filename:
        filename = f"{uuid.uuid4().hex}_{os.path.basename(image_file.filename)}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image_file.save(save_path)
        image_url = f"/uploads/{filename}"
    product = Product(
        name=data['name'],
        type=data['type'],
       quantity=float(data['quantity']),
        image=image_url
    )
    db.session.add(product)
    db.session.commit()
    return jsonify({'id': product.id, 'message': 'Product created'}), 201

@app.route('/qr/<int:product_id>')
def generate_qr(product_id):
    qr_data = f"{product_id}"
    img = qrcode.make(qr_data)
    buf = io.BytesIO()
    img.save(buf, 'PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

@app.route('/scan/<int:product_id>', methods=['GET'])
def scan_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    return jsonify({
        'id': product.id,
        'name': product.name,
        'type': product.type,
        'quantity': product.quantity,
        'image': product.image
    })

@app.route('/sell/<int:product_id>', methods=['POST'])
def sell_product(product_id):
    data = request.json
    amount = float(data['amount'])
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404

    if product.quantity < amount:
        return jsonify({'message': 'Insufficient quantity'}), 400
    
    product.quantity -= amount
    db.session.commit()
    return jsonify({'message': 'Sold successfully', 'remaining': product.quantity})

@app.route('/products', methods=['GET'])
def list_products():
    sort_field = request.args.get('sort', 'id')
    order = request.args.get('order', 'asc')
    valid_fields = {'id': Product.id, 'name': Product.name, 'type': Product.type, 'quantity': Product.quantity}
    sort_col = valid_fields.get(sort_field, Product.id)
    if order == 'desc':
        sort_col = sort_col.desc()
    products = Product.query.order_by(sort_col).all()
    result = []
    for p in products:
        result.append({
            'id': p.id,
            'name': p.name,
            'type': p.type,
            'quantity': p.quantity,
            'image': p.image
        })
    return jsonify(result)


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
