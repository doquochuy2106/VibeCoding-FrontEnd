import "./header.css";

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="brand-name">Todo App</span>
        </div>

        <div className="user-name-text">Đỗ Quốc Huy</div>
      </div>
    </header>
  );
};

export default Header;
