import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/homeStyles.css';

const HomePage = () => {
  return (
    <main className="homePageShell">
      <section className="heroBannerSection">
        <div className="heroTextBlock">
          <p className="heroLabelText">Indian Roads Dataset Demo</p>
          <h1 className="heroHeadline">Road Damage Detection System</h1>
          <p className="heroDescription">
            Upload road images, detect surface damage, and manage reports in one simple dashboard.
          </p>
          <div className="heroActionRow">
            <Link to="/signup" className="primaryActionButton">Create account</Link>
            <Link to="/login" className="secondaryActionButton">Login</Link>
            <Link to="/gov-login" className="secondaryActionButton">Gov login</Link>
          </div>
        </div>
        <div className="heroInfoCard">
          <h2 className="heroCardTitle">What this app does</h2>
          <ul className="featureListBlock">
            <li>Secure signup and login with JWT</li>
            <li>Upload road images with preview</li>
            <li>Store detected damage reports in MongoDB</li>
            <li>Edit or delete your own reports</li>
          </ul>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
