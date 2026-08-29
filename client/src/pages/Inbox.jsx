import React, { useEffect } from 'react';
import { EmailList } from '../components/EmailList/EmailList.jsx';
import { useEmailStore } from '../store/emailStore.js';

export const Inbox = () => {
  const { setActiveFolder } = useEmailStore();

  useEffect(() => {
    setActiveFolder('inbox');
  }, []);

  return <EmailList title="Inbox" folder="inbox" />;
};
