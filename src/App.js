import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../src/componets/custom/style.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";


import Home from "./componets/pages/Home";
import Footer from "./componets/footer/Footer";
import NavBar from "./componets/navbar/NavBar";
import AboutUs from "./componets/pages/AboutUs"; 
import Admissions from "./componets/pages/about_us/Admissions";
import Faculty from "./componets/pages/about_us/Faculty";
import RegistrationModal from "./componets/pages/RegistrationModal";
import DashBoardHeader from "./componets/event_panel/DashBoardHeader";
import Dashboard from "./componets/event_panel/DashBoard";
import Login from "./componets/login/Login";
import UserDashBoard from "./componets/user_dashboard/UserDashBoard";
import AddHeader from "./componets/event_panel/header/AddHeader";
import ManageHeader from "./componets/event_panel/header/ManageHeader";
import TotalRegistration from "./componets/event_panel/totalregistration/TotalRegistration";
import AddEvent from "./componets/event_panel/dashboard_pages/event_create/AddEvent";
import ManageEvent from "./componets/event_panel/dashboard_pages/event_create/ManageEvent";
import AddCarousel from "./componets/event_panel/dashboard_pages/AddCarousel";
import ManageCarousel from "./componets/event_panel/dashboard_pages/ManageCarousel";
import AddAboutUs from "./componets/event_panel/dashboard_pages/AddAboutUs";
import ManageAboutUs from "./componets/event_panel/dashboard_pages/ManageAboutUs";
import Events from "./componets/pages/Events";
import ParticipatedUser from "./componets/event_panel/dashboard_pages/ParticipatedUser";
import UserProfile from "./componets/user_dashboard/profile/UserProfile";
import Contact from "./componets/pages/contact/Contact";
import TotalQuery from "./componets/event_panel/dashboard_pages/TotalQuery";
import ForgotPassword from "./componets/forgot_password/ForgotPassword";
import Corporateevents from "./componets/pages/services/Corporateevents";
import ManageCorporateevents from "./componets/event_panel/dashboard_pages/services_pages/ManageCorporateevents";
import AddCorporateevents from "./componets/event_panel/dashboard_pages/services_pages/AddCorporateevents";
import AddEntertainment from "./componets/event_panel/dashboard_pages/services_pages/AddEntertainment";
import ManageEntertainment from "./componets/event_panel/dashboard_pages/services_pages/ManageEntertainment";
import EntertainmentEvents from "./componets/pages/services/EntertainmentEvents";
import AddConcert from "./componets/event_panel/dashboard_pages/services_pages/AddConcert";
import ManageConcert from "./componets/event_panel/dashboard_pages/services_pages/ManageConcert";
import ConcertEvent from "./componets/pages/services/ConcertEvent";
import AddPrivateParties from "./componets/event_panel/dashboard_pages/services_pages/AddPrivateParties";
import ManageParties from "./componets/event_panel/dashboard_pages/services_pages/ManageParties";
import AddSeminarsConferences from "./componets/event_panel/dashboard_pages/services_pages/AddSeminarsConferences";
import ManageSeminarsConferences from "./componets/event_panel/dashboard_pages/services_pages/ManageSeminarsConferences";
import PrivateParties from "./componets/pages/services/PrivateParties";
import Seminar from "./componets/pages/services/Seminar";
import AddGallery from "./componets/event_panel/dashboard_pages/AddGallery";
import ManageGallery from "./componets/event_panel/dashboard_pages/ManageGallery";
import Gallery from "./componets/pages/Gallery";
import ProtectedRoute from "./componets/protected/ProtectedRoute";
import Registration from "./componets/pages/Registration";


function App() {

  const location = useLocation();

  const hiddenPaths = new Set([
    "/DashBoard",
    "/AddHeader", 
    "/ManageHeader",
    "/TotalRegistration",
    "/AddEvent",
    "/ManageEvent",
    "/AddCarousel",
    "/ManageCarousel",
    "/AddAboutUs",
    "/ManageAboutUs",
    "/UserDashBoard",
    "/ParticipatedUser",
    "/UserProfile",
    "/TotalQuery",
    "/AddCorporateevents",
    "/ManageCorporateevents",
    "/AddEntertainment",
    "/ManageEntertainment",
    "/ManageConcert",
    "/AddConcert",
    "/AddPrivateParties",
    "/ManageParties",
    "/ManageSeminarsConferences",
    "/AddSeminarsConferences",
    "/AddGallery",
    "/ManageGallery"
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  
  return (
    
      <div className="app-container">
        {!shouldHideNavbar && <NavBar />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Home />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/DashBoardHeader" element={<DashBoardHeader />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Admissions" element={<Admissions />} />
            <Route path="/Faculty" element={<Faculty />} />
             <Route path="/RegistrationModal" element={<RegistrationModal />} />
             <Route path="/Events" element={<Events />} />
             <Route path="/Contact" element={<Contact />} />
             <Route path="/ForgotPassword" element={<ForgotPassword />} />
             <Route path="/Corporateevents" element={<Corporateevents />} />
             <Route path="/EntertainmentEvents" element={<EntertainmentEvents />} />
             <Route path="/ConcertEvent" element={<ConcertEvent />} />
             <Route path="/PrivateParties" element={<PrivateParties />} />
             <Route path="/Seminar" element={<Seminar />} />
             <Route path="/Gallery" element={<Gallery />} />
             <Route path="/Registration" element={<Registration />} />
            
            {/* Protected Routes */}
            <Route path="/DashBoard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/UserDashBoard" element={
              <ProtectedRoute>
                <UserDashBoard />
              </ProtectedRoute>
            } />
            <Route path="/AddHeader" element={
              <ProtectedRoute>
                <AddHeader />
              </ProtectedRoute>
            } />
            <Route path="/ManageHeader" element={
              <ProtectedRoute>
                <ManageHeader />
              </ProtectedRoute>
            } />
             <Route path="/TotalRegistration" element={
              <ProtectedRoute>
                <TotalRegistration />
              </ProtectedRoute>
            } />
             <Route path="/AddEvent" element={
              <ProtectedRoute>
                <AddEvent />
              </ProtectedRoute>
            } />
             <Route path="/ManageEvent" element={
              <ProtectedRoute>
                <ManageEvent />
              </ProtectedRoute>
            } />
             <Route path="/AddCarousel" element={
              <ProtectedRoute>
                <AddCarousel />
              </ProtectedRoute>
            } />
             <Route path="/ManageCarousel" element={
              <ProtectedRoute>
                <ManageCarousel />
              </ProtectedRoute>
            } />
             <Route path="/AddAboutUs" element={
              <ProtectedRoute>
                <AddAboutUs />
              </ProtectedRoute>
            } />
             <Route path="/ManageAboutUs" element={
              <ProtectedRoute>
                <ManageAboutUs />
              </ProtectedRoute>
            } />
             <Route path="/ParticipatedUser" element={
              <ProtectedRoute>
                <ParticipatedUser />
              </ProtectedRoute>
            } />
             <Route path="/UserProfile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
             <Route path="/TotalQuery" element={
              <ProtectedRoute>
                <TotalQuery />
              </ProtectedRoute>
            } />
             <Route path="/AddCorporateevents" element={
              <ProtectedRoute>
                <AddCorporateevents />
              </ProtectedRoute>
            } />
             <Route path="/ManageCorporateevents" element={
              <ProtectedRoute>
                <ManageCorporateevents />
              </ProtectedRoute>
            } />
             <Route path="/ManageEntertainment" element={
              <ProtectedRoute>
                <ManageEntertainment />
              </ProtectedRoute>
            } />
             <Route path="/AddEntertainment" element={
              <ProtectedRoute>
                <AddEntertainment />
              </ProtectedRoute>
            } />
             <Route path="/AddConcert" element={
              <ProtectedRoute>
                <AddConcert />
              </ProtectedRoute>
            } />
             <Route path="/ManageConcert" element={
              <ProtectedRoute>
                <ManageConcert />
              </ProtectedRoute>
            } />
             <Route path="/AddPrivateParties" element={
              <ProtectedRoute>
                <AddPrivateParties />
              </ProtectedRoute>
            } />
             <Route path="/ManageParties" element={
              <ProtectedRoute>
                <ManageParties />
              </ProtectedRoute>
            } />
             <Route path="/AddSeminarsConferences" element={
              <ProtectedRoute>
                <AddSeminarsConferences />
              </ProtectedRoute>
            } />
             <Route path="/ManageSeminarsConferences" element={
              <ProtectedRoute>
                <ManageSeminarsConferences />
              </ProtectedRoute>
            } />
             <Route path="/ManageGallery" element={
              <ProtectedRoute>
                <ManageGallery />
              </ProtectedRoute>
            } />
             <Route path="/AddGallery" element={
              <ProtectedRoute>
                <AddGallery />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
           {!shouldHideNavbar && <Footer />}
      
      </div>
 
  );
}

export default App;
