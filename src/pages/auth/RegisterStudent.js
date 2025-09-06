// StudentRegistration.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import { getApp } from "firebase/app";
import "./RegisterStudent.css";

const db = getFirestore(getApp());

// Images des races
const raceImages = {
  Auréalis: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191582/wuopbafesg3qofdu3xxg.png",
  Cornilunes: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191655/uvrppw0nfcta8ihr5uiq.png",
  Drakéides: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191522/tgqpt0htqvl7qicogslh.png",
  Felyriens: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191304/tknokblrabtkjwfnqfxe.png",
  Forgefeu: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191465/ndnndokcfmfnkxdnd2qw.png",
  Infernyx: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191374/clermghgiieqxtlch3sj.png",
  Leporiens: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191230/pxyaeurftt1ivxqkbret.png",
  Lunarys: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191179/yt2zoiavxixeypcmgeo2.png",
  Noctarys: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191124/vyblvlcdt9eswzixopxj.png",
  Renkits: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755191061/knch4e4epaahbgqwgmmd.png",
  Roupaki: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190946/itsaa4fmysjrofol88bn.png",
  Sylvaris: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190887/sr2xnnvmetqm8vgwubaa.png",
  Terrien: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190619/wqwn9hczwubvm0mxevdx.png",
  Tinkerins: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755190707/dnetspuhx23dllo0uux5.png",
};

// Images des classes
const classImages = {
  Alchimiste: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189880/sq4cex4imbrh9p3u5bmo.png",
  Assassin: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189880/sq4cex4imbrh9p3u5bmo.png",
  Astrologue: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189875/mo1r5tg2q96x7cbab8sm.png",
  Barbare: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189877/syseplhbnejrrej7ytrn.png",
  Barde: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189885/uralqp7x5vtw3dgv13up.png",
  "Change-peau": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189875/f4cutiucidxgwkq3sumq.png",
  Chevalier: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189887/vd50gqwqm1unhqhpcsti.png",
  "Chevalier noir": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189875/kdlek3fin76mnqamk7ql.png",
  Druide: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189884/iqf7tissebik1hdvaigw.png",
  Elementaire: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189884/quveqobixuygwk3zbeqy.png",
  Guerrier: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189878/k5qz9r6eiypgvydirz1l.png",
  Ingénieur: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755193625/dte0bzxqvo1njq6lp6rm.png",
  Mage: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189882/qf07ulw69vb8s9y8ggtt.png",
  "Maître d'arme": "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189886/nh0xqlpaxzmk8msipavv.png",
  Necromancien: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189875/yn1f0cn2b3uwr5yotuqv.png",
  Paladin: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189879/ft5nvypr9wigwfyynqut.png",
  Pistolero: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189883/b21qzle94icffxti56bv.png",
  Rodeur: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189876/tv5dzreaghcaxrycurff.png",
  Soigneur: "https://res.cloudinary.com/dtgnkoafc/image/upload/v1755189881/mfxkra86qblevpd1fsip.png",
};

export default function StudentRegistration() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [student, setStudent] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    race: "",
    classe: "",
    photoURL: "",
    mana: 100,
    xp: 0,
    kitsuCoins: 0,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [selectedRaceImage, setSelectedRaceImage] = useState("");
  const [selectedClassImage, setSelectedClassImage] = useState("");

  // Vérification du token professeur
  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("Veuillez entrer un token.");

    try {
      const teachersRef = collection(db, "Teachers");
      const q = query(teachersRef, where("token", "==", token));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setVerified(true);
        setTeacherId(querySnapshot.docs[0].id);
      } else {
        alert("Token invalide !");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la vérification du token.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));

    if (name === "race") setSelectedRaceImage(raceImages[value] || "");
    if (name === "classe") setSelectedClassImage(classImages[value] || "");
  };

  const handlePhotoChange = (e) => setPhotoFile(e.target.files[0]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let photoURL = "";

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("upload_preset", "Kitsu-edu");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dtgnkoafc/image/upload",
          { method: "POST", body: formData }
        );
        const data = await res.json();
        photoURL = data.secure_url;
      }

      await setDoc(doc(db, "Students", student.username), {
        ...student,
        photoURL,
        teacherId,
      });

      alert("Étudiant enregistré avec succès !");

      setStudent({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        race: "",
        classe: "",
        photoURL: "",
        mana: 0,
        xp: 0,
        kitsuCoins: 0,
      });
      setPhotoFile(null);
      setSelectedRaceImage("");
      setSelectedClassImage("");

      navigate(`/student-dashboard/${student.username}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement !");
    }
  };

  if (!verified) {
    return (
      <div className="student-registration-container">
        <div className="left-panel">
          <div className="content-wrapper"> {/* ← CENTRAGE */}
            <div className="form-wrapper">
              <h2>Vérification du Token Professeur</h2>
              <form onSubmit={handleTokenSubmit}>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Entrez le token"
                />
                <button type="submit">Vérifier</button>
              </form>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <h2>Bienvenue sur Kitsu-edu</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="student-registration-container">
      <div className="left-panel">
        <div className="content-wrapper"> {/* ← CENTRAGE */}
          <div className="form-wrapper">
            <h2>Inscription Étudiant</h2>
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                name="firstName"
                value={student.firstName}
                onChange={handleInputChange}
                placeholder="Prénom"
                required
              />
              <input
                type="text"
                name="lastName"
                value={student.lastName}
                onChange={handleInputChange}
                placeholder="Nom"
                required
              />
              <input
                type="text"
                name="username"
                value={student.username}
                onChange={handleInputChange}
                placeholder="Nom d'utilisateur"
                required
              />
              <input
                type="password"
                name="password"
                value={student.password}
                onChange={handleInputChange}
                placeholder="Mot de passe"
                required
              />
              <select
                name="race"
                value={student.race}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez la race</option>
                {Object.keys(raceImages).map((race) => (
                  <option key={race} value={race}>
                    {race}
                  </option>
                ))}
              </select>
              <select
                name="classe"
                value={student.classe}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez la classe</option>
                {Object.keys(classImages).map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
              <input type="file" onChange={handlePhotoChange} />
              <button type="submit">Enregistrer l'étudiant</button>
            </form>
          </div>
        </div>
      </div>

      <div className="right-panel">
        {selectedRaceImage && (
  <img src={selectedRaceImage} alt="Race" className="registration-race-image" />
)}
{selectedClassImage && (
  <img src={selectedClassImage} alt="Classe" className="registration-class-image" />
)}

      </div>
    </div>
  );
}