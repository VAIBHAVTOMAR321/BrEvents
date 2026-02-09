import React, { useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments,
  FaCube,
  FaProjectDiagram,
  FaServer,
  FaUserCircle,
  FaCalendarAlt,
  FaPlusSquare,
  FaListUl,
  FaEdit,
  FaMusic,
  FaGlassCheers,
  FaChalkboardTeacher,
  FaIndustry
} from "react-icons/fa";
import axios from "axios";
import "../../assets/css/dashboard.css";
import { Link } from "react-router-dom";
import {
  FaInfoCircle,
  FaBullseye,
  FaTasks
} from "react-icons/fa";

// import BRLogo from "../../assets/images/brainrock_logo.png";

const LeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
    // const { logout } = useContext(AuthContext);
    // const { user } = useContext(AuthContext);
// const emp_id = user?.unique_id;  // This is the correct value

    const [userRole, setUserRole] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/DashBoard",
      active: true,
    },
   
    // {
    //   icon: <FaUsers />,
    //   label: "Total Registration",
    //   path: "/TotalRegistration",
    //   active: true,
    // },
    {
      icon: <FaUserCircle />,
      label: "Total Participated User",
      path: "/ParticipatedUser",
      active: true,
    },
    {
      icon: <FaComments />,
      label: "Total Query",
      path: "/TotalQuery",
      active: true,
    },

    {
      icon: <FaCalendarAlt />,
      label: "Event",
      submenu: [
        {
          label: "Add Event",
          path: "/AddEvent",
          icon: <FaPlusSquare />,
        },
        {
          label: "Manage Event",
          path: "/ManageEvent",
          icon: <FaListUl />,
        },
      ],
    },

     {
      icon: <FaCalendarAlt />,
      label: "Blogs",
      submenu: [
        {
          label: "Add blogs",
          path: "/Addblogs",
          icon: <FaPlusSquare />,
        },
        {
          label: "Manage blogs",
          path: "/Manageblogs",
          icon: <FaListUl />,
        },
      ],
    },
    {
      icon: <FaImages />,
      label: "Carousel",
      submenu: [
        {
          label: "AddCarousel ",
          path: "/AddCarousel",
          icon: <FaPlusSquare />,
        },
        {
          label: "Manage Carousel",
          path: "/ManageCarousel",
          icon: <FaListUl />,
        },
      ],
    },
    {
      icon: <FaInfoCircle />,
      label: "AboutUs",
      submenu: [
        {
          label: "Add AboutUs",
          path: "/AddAboutUs",
          icon: <FaPlusSquare />,
        },
        {
          label: "Manage AboutUs",
          path: "/ManageAboutUs",
          icon: <FaEdit />,
        },
      ],
    },
    {
      icon: <FaBuilding />,
      label: "Header",
      submenu: [
        {
          label: "Manage header",
          path: "/ManageHeader",
          icon: <FaEdit />,
        },
      ],
    },
    {
      icon: <FaImage />,
      label: "Gallery",
      submenu: [
        {
          label: "Add Gallery",
          path: "/AddGallery",
          icon: <FaPlusSquare />,
        },
        {
          label: "Manage Gallery",
          path: "/ManageGallery",
          icon: <FaListUl />,
        },
      ],
    },
    {
      icon: <FaTools />,
      label: "Services",
      submenu: [
        {
          label: "Add Corporateevents",
          path: "/AddCorporateevents",
          icon: <FaIndustry />,
        },
        {
          label: "Corporate Manage Services",
          path: "/ManageCorporateevents",
          icon: <FaListUl />,
        },
        {
          label: "Add Entertainment",
          path: "/AddEntertainment",
          icon: <FaMusic />,
        },
        {
          label: "Manage Entertainment",
          path: "/ManageEntertainment",
          icon: <FaListUl />,
        },
        {
          label: "Add Concert",
          path: "/AddConcert",
          icon: <FaMusic />,
        },
        {
          label: "Manage Concert",
          path: "/ManageConcert",
          icon: <FaListUl />,
        },
        {
          label: "Add Parties",
          path: "/AddPrivateParties",
          icon: <FaGlassCheers />,
        },
        {
          label: "Manage Parties",
          path: "/ManageParties",
          icon: <FaListUl />,
        },
        {
          label: "Add Seminars Conferences",
          path: "/AddSeminarsConferences",
          icon: <FaChalkboardTeacher />,
        },
        {
          label: "Manage Seminars Conferences",
          path: "/ManageSeminarsConferences",
          icon: <FaListUl />,
        },
      ],
    },
  ];

  //  Auto-close sidebar when switching to mobile or tablet

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
             Admin DashBoard
              {/* <span className="logo-text"><img src={BRLogo} alt="text"></img></span> */}
            </div>
          </div>
        </div>

        <Nav className="sidebar-nav flex-column">
          
        {menuItems
  .filter(item =>
    item.allowedRoles ? item.allowedRoles.includes(userRole) : true
  )
  .map((item, index) => (
    <div key={index}>
      {/* If submenu exists */}
      {item.submenu ? (
        <Nav.Link
          className={`nav-item ${item.active ? "active" : ""}`}
          onClick={() => toggleSubmenu(index)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
          <span className="submenu-arrow">
            {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </Nav.Link>
      ) : (
        <Link
          to={item.path}
          className={`nav-item nav-link ${item.active ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {item.submenu && (
        <Collapse in={openSubmenu === index}>
          <div className="submenu-container">
            {item.submenu.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                to={subItem.path}
                className="submenu-item nav-link"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="submenu-icon">{subItem.icon}</span>
                <span className="nav-text br-text-sub">{subItem.label}</span>
              </Link>
            ))}
          </div>
        </Collapse>
      )}
    </div>
  ))}

        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
        //    onClick={logout}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="mobile-sidebar"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
>
  <Offcanvas.Header closeButton className="br-offcanvas-header">
    <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="br-offcanvas">
    <Nav className="flex-column">
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.submenu ? (
            <Nav.Link
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => toggleSubmenu(index)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
              <span className="submenu-arrow">
                {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </Nav.Link>
          ) : (
            <Link
              to={item.path}
              className={`nav-item nav-link ${item.active ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
            </Link>
          )}

          {item.submenu && (
            <Collapse in={openSubmenu === index}>
              <div className="submenu-container">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    className="submenu-item nav-link"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-text">{subItem.label}</span>
                  </Link>
                ))}
              </div>
            </Collapse>
          )}
        </div>
      ))}
    </Nav>
  </Offcanvas.Body>
</Offcanvas>

    </>
  );
};

export default LeftNav;