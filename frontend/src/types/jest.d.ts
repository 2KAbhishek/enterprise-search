declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveClass(className: string): R;
            toHaveTextContent(text: string): R;
            toBeVisible(): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toHaveValue(value: string | number): R;
            toHaveFocus(): R;
        }
    }
}

export {};
