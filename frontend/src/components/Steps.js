import React from 'react';

export default function Steps({ steps, currentStep, status }) {
  return (
    <div className="steps">
      <span className="step step-done">SUBMITTED</span>
      {steps.map((role, i) => {
        let cls = 'step';
        if (status === 'approved' || i < currentStep) cls = 'step step-done';
        else if (i === currentStep && status === 'rejected') cls = 'step step-rejected';
        else if (i === currentStep) cls = 'step step-current';
        return (
          <React.Fragment key={i}>
            <span className="arrow">&rarr;</span>
            <span className={cls}>{role.toUpperCase()}</span>
          </React.Fragment>
        );
      })}
      <span className="arrow">&rarr;</span>
      <span className={status === 'approved' ? 'step step-done' : 'step'}>APPROVED</span>
    </div>
  );
}
