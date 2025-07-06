# procducts_sort

This simple inventory demo allows creating products with QR codes.

### New features

- Select which camera to use when scanning.
- Browse all products, including their QR codes and optional image.
- Product images can now be uploaded directly instead of providing a URL.
- Products can be sorted by id, name, type or quantity.

When upgrading from earlier versions, delete `backend/instance/inventory.db` to recreate the database with the new image field. Uploaded product images are stored in `backend/uploads`.