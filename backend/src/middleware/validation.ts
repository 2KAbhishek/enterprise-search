import {Request, Response, NextFunction} from 'express';

export const validateChatRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const {message} = req.body as {message?: unknown};

    if (
        !message ||
        typeof message !== 'string' ||
        message.trim().length === 0
    ) {
        res.status(400).json({
            success: false,
            error: 'Message is required and must be a non-empty string'
        });
        return;
    }

    if (message.length > 10000) {
        res.status(400).json({
            success: false,
            error: 'Message is too long (max 10000 characters)'
        });
        return;
    }

    next();
};
