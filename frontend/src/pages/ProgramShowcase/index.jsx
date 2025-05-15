import React from 'react';
// import './ProgramShowcase.css'; // Optional external CSS
import logo from "../../assets/logo.png"; // Adjust path if needed

const ProgramShowcase = () => {
  return (
    <div>
      {/* Header */}
      <header style={{ backgroundColor: '#800000', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              border: 'none',
              width: '250px'
            }}
          />
          <span role="img" aria-label="notifications" style={{ color: 'white' }}>🔔</span>
        </div>
      </header>

      {/* Hero Section */}
    <section style={{ position: 'relative', textAlign: 'center' }}>
        <img
            src={require("../../assets/login-bg.png")}
            alt="Hero"
            style={{ width: '50%', height: '50%', opacity: 0.8 }}
        />
        <div style={{ position: 'absolute', top: '99%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <img src={logo} alt="ETEEAPP Logo" style={{ width: '200px' }} />
        </div>
    </section>

      {/* Intro */}
      <section style={{ padding: '4rem', textAlign: 'center', fontFamily: 'monospace' }}>
        <h4>What is ETEEAPP?</h4>
        <p>
          The ETEEAPP System is designed to optimize and streamline the application process for the
          Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP). The platform will
          cater to both individual students seeking accreditation for their previous tertiary education
          and those applying for multiple program choices.
        </p>
        <strong><em>“Your Experience, Your Credential, Your Success.”</em></strong>
        <p><strong><em>NON-FORMAL LEARNING</em></strong> is intentional and acquired through participation in structured workplace-based training, non-credit courses, and workshops.</p>
        <p><strong><em>INFORMAL LEARNING</em></strong> occurs incidentally through life experiences, workplace activities, self-directed learning, family responsibilities, etc.</p>
      </section>

      {/* Qualifications */}
      <section style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h4 style={{ textAlign: 'center' }}>BASIC APPLICANT QUALIFICATIONS</h4>
        <ul>
          <li>Is a Filipino;</li>
          <li>Has 5 years or more of RELEVANT AND MEANINGFUL work experience (related to the degree applied);</li>
          <li>Is 25 years old or more; and</li>
          <li>
            Has two years of college credits for Engineering and Architecture and all other board and
            computer programs; High School Graduate for non-board programs, except BSIE.
          </li>
        </ul>
        <small>
          Note: CMO No. 29 Series of 2021 - Article 5 Implementing Guidelines
        </small>
        <br />
        <small>
          3. Qualifications of the individual applying for equivalency and accreditation
        </small>
        <br />
        <small>
          3.3 For an employed applicant she or he should have an aggregate of at least five years in
          the industry related to the academic degree program or discipline.
        </small>
      </section>

      {/* Programs */}
      <section style={{ backgroundColor: '#f2f2f2', padding: '2rem', fontFamily: 'monospace' }}>
        <h4 style={{ textAlign: 'center' }}>PROGRAMS COVERED</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
          <div>
            <h5>College of Management, Business, and Accountancy</h5>
            <ul>
              <li>BSBA: General, HR, Marketing, Banking, etc.</li>
              <li>Bachelor in Public Administration</li>
              <li>BS Office Administration</li>
            </ul>
          </div>
          <div>
            <h5>College of Computer Studies</h5>
            <ul>
              <li>BS Information Technology</li>
            </ul>
          </div>
          <div>
            <h5>College of Arts, Sciences, and Education</h5>
            <ul>
              <li>AB Communication</li>
              <li>BS Elementary Education</li>
              <li>BS Secondary Education: English, Filipino, Math, Science</li>
            </ul>
          </div>
          <div>
            <h5>College of Engineering and Architecture</h5>
            <ul>
              <li>BS Architecture</li>
              <li>BS Civil, Electrical, Electronics, Mechanical, Computer, Industrial Engineering</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#f2c300', padding: '1rem', textAlign: 'center' }}>
        <p>Contact us!</p>
        <div>
          <a href="#"><img src="https://img.icons8.com/ios-filled/20/facebook--v1.png" alt="Facebook" /></a>
          <a href="#"><img src="https://img.icons8.com/ios-filled/20/instagram-new.png" alt="Instagram" /></a>
          <a href="#"><img src="https://img.icons8.com/ios-filled/20/twitter.png" alt="Twitter" /></a>
          <a href="#"><img src="https://img.icons8.com/ios-filled/20/linkedin.png" alt="LinkedIn" /></a>
        </div>
      </footer>
    </div>
  );
};

export default ProgramShowcase;
