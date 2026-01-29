/**
 * Generic validation middleware for Express routes.
 * @param {Function} schemaValidator - A function that validates the req.body and returns an error if invalid.
 */
const validateRequest = (schemaValidator) => {
    return (req, res, next) => {
        const { error } = schemaValidator(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation Error",
                details: error.details.map(d => d.message)
            });
        }
        next();
    };
};

module.exports = { validateRequest };
