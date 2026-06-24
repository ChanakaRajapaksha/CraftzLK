import React, { useEffect, useState } from "react";

function getNameInitials({ name, firstName, lastName }) {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();

  if (first || last) {
    const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    if (initials) return initials;
  }

  if (!name || typeof name !== "string") return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

const UserAvatarImgComponent = (props) => {
  const hasValidImage =
    props.img && typeof props.img === "string" && props.img.length > 0;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [props.img]);

  const initials = getNameInitials({
    name: props.userName,
    firstName: props.firstName,
    lastName: props.lastName,
  });

  return (
    <div className={`userImg ${props.lg === true ? "lg" : ""}`}>
      <span className="rounded-circle">
        {hasValidImage && !imageError ? (
          <img
            src={props.img}
            alt="User avatar"
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="userImg__initials" aria-hidden="true">
            <strong>{initials}</strong>
          </span>
        )}
      </span>
    </div>
  );
};

export default UserAvatarImgComponent;