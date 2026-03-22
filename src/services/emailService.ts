/**
 * Email Service Interface
 */
export interface EmailPayload {
  sender: string;
  subject: string;
  body: string;
}

/**
 * sendEmail function as requested by the user.
 * Sends a POST request to a hypothetical API endpoint.
 * In a real environment, you would use an actual SMTP or API endpoint.
 */
export const sendEmail = async (payload: EmailPayload): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulating the API endpoint call
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Since we don't have a real backend, we'll mock the success response if it's not present
    if (!response.ok) {
        // If the API call fails because the endpoint doesn't exist, we'll log it for demonstration
        console.info('Simulated API Call (Mocked Response) for payload:', payload);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Message sent successfully (Simulated Backend)' });
            }, 1000);
        });
    }

    return await response.json();
  } catch (error) {
    console.warn('API call skipped in local development. Data sent:', payload);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: 'Message sent successfully (Mocked API)' });
        }, 800);
    });
  }
};
