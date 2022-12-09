import React from 'react';
import {
Nav,
NavLink,
Bars,
NavMenu,
NavBtn,
NavBtnLink,
} from './NavbarElements';

const Navbar = () => {
return (
	<>
	<Nav>
		<Bars />
		<NavLink to='/about' className={(navData) => (navData.isActive ? "active-style" : 'none')}>
			About
		</NavLink>
		<NavLink to='/overview' className={(navData) => (navData.isActive ? "active-style" : 'none')}>
			Overview
		</NavLink>
		<NavLink to='/comparison' className={(navData) => (navData.isActive ? "active-style" : 'none')}>
			Comparison
		</NavLink>
		<NavLink to='/distribution' className={(navData) => (navData.isActive ? "active-style" : 'none')}>
			Global Distribution
		</NavLink>
		{/* Second Nav */}
		{/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
		{/* A ghost button */}
		{/* <NavBtn>
		<NavBtnLink to='/signin'>Search</NavBtnLink>
		</NavBtn> */}
	</Nav>
	</>
);
};

export default Navbar;
