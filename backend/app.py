from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import qrcode
import io

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
db = SQLAlchemy(app)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'standard' or 'fabric'
    quantity = db.Column(db.Float, nullable=False)   # integer for standard, float for fabric (meters)

with app.app_context():
    db.create_all()

@app.route('/product', methods=['POST'])
def create_product():
    data = request.json
    product = Product(
        name=data['name'],
        type=data['type'],
        quantity=float(data['quantity'])
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
        'quantity': product.quantity
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
