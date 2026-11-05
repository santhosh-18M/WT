# Postman Collection

Import `RoadDamageDetectionSystem.postman_collection.json` into Postman.

Workflow:
1. Run `Signup` or `Login`.
2. The `Login` request saves the JWT token into the collection variable `token`.
3. Paste a `reportId` into the collection variable if you want to test update/delete requests.
4. For `Create Report`, attach an image file in the `image` field.
