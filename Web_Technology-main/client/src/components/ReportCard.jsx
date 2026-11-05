import React from 'react';
import '../styles/reportCardStyles.css';

const ReportCard = ({ report, onEdit, onDelete }) => {
  return (
    <article className="reportCard">
      <img src={report.imageUrl} alt="Road damage report" className="reportImageThumb" />
      <div className="reportDetailsArea">
        <p className="reportTypeText">Damage: {report.damageType}</p>
        <p className="reportLocationText">Location: {report.location}</p>
        <p className="reportConfidenceText">Confidence: {report.confidence}%</p>
        <p className="reportDateText">Created: {new Date(report.createdAt).toLocaleString()}</p>
        <div className="reportActionRow">
          <button type="button" className="actionButtonEdit" onClick={() => onEdit(report._id)}>Edit</button>
          <button type="button" className="deleteButtonRed" onClick={() => onDelete(report._id)}>Delete</button>
        </div>
      </div>
    </article>
  );
};

export default ReportCard;
