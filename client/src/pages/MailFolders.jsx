import React, { useEffect } from 'react';
import { EmailList } from '../components/EmailList/EmailList.jsx';
import { useEmailStore } from '../store/emailStore.js';

export const Starred = () => {
  const { setActiveFolder } = useEmailStore();
  useEffect(() => {
    setActiveFolder('starred');
  }, []);
  return <EmailList title="Starred" folder="starred" />;
};

export const Sent = () => {
  const { setActiveFolder } = useEmailStore();
  useEffect(() => {
    setActiveFolder('sent');
  }, []);
  return <EmailList title="Sent" folder="sent" />;
};

export const Archive = () => {
  const { setActiveFolder } = useEmailStore();
  useEffect(() => {
    setActiveFolder('archive');
  }, []);
  return <EmailList title="Archive" folder="archive" />;
};

export const Trash = () => {
  const { setActiveFolder } = useEmailStore();
  useEffect(() => {
    setActiveFolder('trash');
  }, []);
  return <EmailList title="Trash" folder="trash" />;
};
