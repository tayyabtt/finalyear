/* context/ProfileContext.tsx */
import React, { createContext, useContext, useState } from 'react';

export type ProfileCtx = {
  avatar: string | null;
  setAvatar: (uri: string | null) => void;
  name: string;
  setName: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
};

/* default values so TypeScript is happy */
const ProfileContext = createContext<ProfileCtx>({
  avatar: null,
  setAvatar: () => {},
  name: 'Malik Faizan',
  setName: () => {},
  email: 'you@example.com',
  setEmail: () => {},
  phone: '',
  setPhone: () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name,   setName]   = useState('Malik Faizan');
  const [email,  setEmail]  = useState('you@example.com');
  const [phone,  setPhone]  = useState('');

  return (
    <ProfileContext.Provider
      value={{ avatar, setAvatar, name, setName, email, setEmail, phone, setPhone }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
