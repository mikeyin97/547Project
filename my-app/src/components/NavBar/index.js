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
		<NavMenu>
		<NavLink to='/about' activeStyle>
			About
		</NavLink>
		<NavLink to='/overview' activeStyle>
			Overview
		</NavLink>
		<NavLink to='/comparison' activeStyle>
			Comparison
		</NavLink>
		<NavLink to='/distribution' activeStyle>
			Global Distribution
		</NavLink>
		<NavLink to='/contacts' activeStyle>
			Contacts
		</NavLink>
		{/* Second Nav */}
		{/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
		</NavMenu>
		{/* A ghost button */}
		<NavBtn>
		<NavBtnLink to='/signin'>Search</NavBtnLink>
		</NavBtn>
	</Nav>
	</>
);
};

export default Navbar;
