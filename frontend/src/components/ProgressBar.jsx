import React from "react";

const ProgressBar = ({
    value = 0,
    label = "Progress",
    showPercentage = true,
    height = 8,
    variant = "primary",
}) => {

    const progress = Math.min(
        100,
        Math.max(0, Number(value) || 0)
    );

    return (
        <div className="w-100">

            {(label || showPercentage) && (
                <div className="d-flex justify-content-between align-items-center mb-2">

                    {label && (
                        <span className="small fw-medium text-secondary">
                            {label}
                        </span>
                    )}

                    {showPercentage && (
                        <span className="small fw-semibold text-dark">
                            {progress.toFixed(0)}%
                        </span>
                    )}

                </div>
            )}

            <div
                className="progress"
                role="progressbar"
                aria-label={label}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{
                    height: `${height}px`,
                    borderRadius: "999px",
                    backgroundColor: "#e9ecef",
                }}
            >

                <div
                    className={`progress-bar bg-${variant}`}
                    style={{
                        width: `${progress}%`,
                        transition: "width 0.5s ease",
                        borderRadius: "999px",
                    }}
                />

            </div>

        </div>
    );
};

export default ProgressBar;