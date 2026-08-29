import React from 'react';
import { useParams } from 'react-router-dom';
import { EmailViewer } from '../components/EmailViewer/EmailViewer.jsx';

export const Email = () => {
  const { id } = useParams();
  return <EmailViewer emailId={id} />;
};
