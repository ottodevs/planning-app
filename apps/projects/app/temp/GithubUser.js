import React, { useState, useEffect } from 'react';
// import { hot } from 'react-hot-loader/root';

const useGithub = userName => {
  const [user, setUser] = useState();
  useEffect(() => {
    fetch(`https://api.github.com/users/${userName}`)
      .then(r => r.json())
      .then(setUser);
  }, [userName]);

  return user;
};

function GithubUser() {
  const user = useGithub('ottodevs');

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Hello <b>{user.login}</b>
      <p>{user.followers}</p>
      <p>{user.following}</p>
    </div>
  );
}

export default GithubUser;
