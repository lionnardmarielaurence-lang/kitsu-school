import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './LoginStudent.css';

// Images des races
const raceImages = {
  "Auréalis": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191582/wuopbafesg3qofdu3xxg.png",
  "Cornilunes": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191655/uvrppw0nfcta8ihr5uiq.png",
  "Drakéides": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191522/tgqpt0htqvl7qicogslh.png",
  "Felyriens": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191304/tknokblrabtkjwfnqfxe.png",
  "Forgefeu": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191465/ndnndokcfmfnkxdnd2qw.png",
  "Infernyx": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191374/clermghgiieqxtlch3sj.png",
  "Leporiens": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191230/pxyaeurftt1ivxqkbret.png",
  "Lunarys": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191179/yt2zoiavxixeypcmgeo2.png",
  "Noctarys": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191124/vyblvlcdt9eswzixopxj.png",
  "Renkits": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191061/knch4e4epaahbgqwgmmd.png",
  "Roupaki": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190946/itsaa4fmysjrofol88bn.png",
  "Sylvaris": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190887/sr2xnnvmetqm8vgwubaa.png",
  "Terrien": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190619/wqwn9hczwubvm0mxevdx.png",
  "Tinkerins": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190707/dnetspuhx23dllo0uux5.png"
};

function LoginStudent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Sélection aléatoire d'une image
  const raceKeys = Object.keys(raceImages);
  const randomRaceKey = raceKeys[Math.floor(Math.random() * raceKeys.length)];
  const randomRaceImage = raceImages[randomRaceKey];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const normalizedUsername = username.toLowerCase();
      const q = query(
        collection(db, 'Students'),
        where('username', '==', normalizedUsername),
        where('password', '==', password)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        localStorage.setItem("currentStudent", normalizedUsername);
        navigate(`/student-dashboard/${normalizedUsername}`);
      } else {
        setError('Nom d’utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la connexion');
    }
  };

  return (
    <div className="login-page">
      {/* Côté gauche */}
      <div className="login-left">
        <div className="login-container">
          <img
            src="https://res.cloudinary.com/dtgnkoafc/image/upload/v1755288275/jhzrnenrr9zr3dommt04.png"
            alt="Logo App"
            className="app-logo"
          />
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-login">Se connecter</button>
            {error && <p className="error-message">{error}</p>}
          </form>
          <button className="return-button" onClick={() => navigate('/')}>
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* Côté droit */}
      <div className="login-right">
        <img
          src={randomRaceImage}
          alt={randomRaceKey}
          className="login-race-image"
        />
      </div>
    </div>
  );
}

export default LoginStudent;
