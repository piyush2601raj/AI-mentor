function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconClass = "bg-primary"
}) {

    return (
        <div className="col-md-6 col-xl-3 mb-4">

            <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>

                            <p className="text-muted mb-2">
                                {title}
                            </p>

                            <h2 className="fw-bold mb-1">
                                {value}
                            </h2>

                            {subtitle && (
                                <small className="text-muted">
                                    {subtitle}
                                </small>
                            )}

                        </div>

                        <div
                            className={`rounded-3 ${iconClass} text-white d-flex align-items-center justify-content-center`}
                            style={{
                                width: "48px",
                                height: "48px",
                                fontSize: "22px"
                            }}
                        >
                            {icon}
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default StatCard;