// src/pages/student/StudentProfil.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../Firebase";
import "./StudentProfil.css";

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

const MAX_XP = 1000;
const MAX_MANA = 250;

const StudentProfil = () => {
  const { username } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!username) return;

    const studentsRef = collection(db, "Students");
    const q = query(studentsRef, where("username", "==", username));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setStudent(snapshot.docs[0].data());
      } else {
        setStudent(null);
      }
    });

    return () => unsubscribe();
  }, [username]);

  if (!student) return <p>Chargement...</p>;

  const level = Math.floor(student.xp / MAX_XP);
  const xpPercent = ((student.xp % MAX_XP) / MAX_XP) * 100;
  const manaPercent = (student.mana / MAX_MANA) * 100;
  const classBlason = classImages[student.classe] || "";
  const raceImageURL = raceImages[student.race] || "";

  return (
    <div className="student-profile">
      {/* Blason de classe */}
      {classBlason && <img className="class-blason" src={classBlason} alt={student.classe} />}

      {/* Infos étudiant */}
      <div className="student-info">
        <img
          className="student-photo"
          src={student.photoURL || "https://via.placeholder.com/96"}
          alt={`${student.firstName} ${student.lastName}`}
        />
        <div className="student-text">
          <h2>{student.firstName} {student.lastName}</h2>
          <p>Race: {student.race}</p>
          <p>Classe: {student.classe}</p>
        </div>
      </div>

      {/* XP et Mana avec race à droite */}
      <div className="xp-mana-wrapper">
        <div className="xp-mana-bars">
          <div className="xp-container">
            <div className="xp-header">
              <div className="level-medal">{level}</div>
              <span>{student.xp} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }}></div>
            </div>
          </div>

          <div className="mana-container">
            <div className="mana-header">
              <span>Mana</span>
              <span>{student.mana} / {MAX_MANA}</span>
            </div>
            <div className="mana-bar">
              <div className="mana-bar-fill" style={{ width: `${manaPercent}%` }}></div>
            </div>
          </div>
        </div>

        {raceImageURL && (
          <img className="race-image" src={raceImageURL} alt={student.race} />
        )}
      </div>

      {/* KitsuCoins */}
      <div className="kitsucoins">
        <span role="img" aria-label="KitsuCoins">💰</span>
        <span>{student.kitsuCoins || 0}</span>
      </div>
    </div>
  );
};

export default StudentProfil;
