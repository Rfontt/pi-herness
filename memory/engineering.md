Global engineering preferences and rules learned over time. Apply these across all projects.
- HTTP adapters follow SRP: controllers stay thin (bind → call use case → write response); request DTOs in a request/ package, response DTOs in a response/ package (with a constructor mapping the app result to the DTO); error→HTTP-status mapping in a dedicated error_handler file/package.
