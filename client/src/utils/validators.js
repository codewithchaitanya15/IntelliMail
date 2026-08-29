export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateComposeForm = ({ to, subject, body }) => {
  const errors = {};
  if (!to || !to.trim()) {
    errors.to = 'Recipient email is required';
  } else if (!isValidEmail(to.trim())) {
    errors.to = 'Please provide a valid recipient email address';
  }

  if (!subject || !subject.trim()) {
    errors.subject = 'Subject line is required';
  }

  if (!body || !body.trim()) {
    errors.body = 'Email message content cannot be empty';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
