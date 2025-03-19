"use client";
import {
	RiArrowDownSLine,
	RiArrowRightSLine,
	RiDoorLockBoxLine,
	RiHome6Fill,
	RiLockPasswordLine,
	// RiLogoutCircleFill,
	// RiNotificationBadgeLine,
} from 'react-icons/ri';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { LogOut, toTitleCase } from '@/app/utils';
import { useEffect, useState } from 'react';
// import { RiMenuLine } from 'react-icons/ri';
// import { FaUserCircle } from 'react-icons/fa';
// import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

const userTemplate = {
	firstName: '',
	lastName: '',
	email: '',
};

const DashboardHeader = () => {
	// const router = useRouter();
	// const t = useTranslations("DashboardHeader");  // Commenting out until translations are added

	const [userString, setUserString] = useState(Cookies.get('user') || JSON.stringify(userTemplate));

	useEffect(() => {
		setUserString(Cookies.get('user') || JSON.stringify(userTemplate));
	}, []);

	const [user, setUser] = useState(JSON.parse(userString as string));

	useEffect(() => {
		setUser(JSON.parse(userString as string));
	}, [userString]);

	const [fname, setFname] = useState('');
	const [lname, setLname] = useState('');
	const [role, setRole] = useState('Admin');
	useEffect(() => {
		setFname(user?.firstName || '');
		setLname(user?.lastName || '');
		setRole(user?.role || 'Admin');
	}, [user]);

	const logOut = () => {
		return LogOut();
	};

	const [pharmacyName, setPharmacyName] = useState('');

	//get pharmacy details
	const userDetails = Cookies.get('user');

	useEffect(() => {
		if (userDetails) {
			const { pharmacy } = JSON.parse(userDetails);

			if (pharmacy?.name) {
				setPharmacyName(pharmacy.name);
			} else {
				setPharmacyName('');
			}
		}
	}, [userDetails]);
	
	const pathname = usePathname();
	if (!pathname) {
		return null;
	}
	const sections = pathname.split('/').filter(Boolean);

	// const clean = (text: string) => {
	// 	//remove dashes
	// 	text = text.replace('-', ' ');
	// 	text = toTitleCase(text);
	// 	return text;
	// };

	
	

	return (
		<>
			<header className='flex sm:justify-start sm:flex-nowrap w-full text-sm px-4 border-b'>
				<nav
					className=' w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between'
					aria-label='Global'
				>
					{/*Bread Crumbs*/}
					<div className='flex items-center justify-between'>
						<ol className='flex items-center whitespace-nowrap gap-2'>
							{sections.map((section, index) =>
								index == 0 ? (
									<li
										key={index}
										className='inline-flex items-center text-sm  text-gray-800 truncate'
									>
										<a
											key={index}
											className='flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600'
											href='/pharmacy'
										>
											<RiHome6Fill className={'size-5 mr-1'} />
											Home
										</a>
									</li>

									
								) : (
									<li
										key={index}
										className='inline-flex items-center text-sm font-semibold text-gray-800 truncate'
										aria-current='page'
									>
										<RiArrowRightSLine className={'size-5 mr-1'} />
										Dashboard Overview
									</li>
								)
							)}
						</ol>
					</div>
					{/*Profile*/}
					<div
						id='navbar-with-mega-menu'
						className='hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block'
					>
						<div className='flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:ps-5'>
							{/*Notifications*/}
							{/*<div*/}
							{/*  className={*/}
							{/*    "w-12 h-12 bg-[#E7E8EE] rounded-full flex items-center justify-center cursor-pointer"*/}
							{/*  }*/}
							{/*>*/}
							{/*  <RiNotificationBadgeLine className={"size-5"} />*/}
							{/*</div>*/}

							
							<div className={'flex items-center gap-2 cursor-pointer'}>
								<div className='m-1 hs-dropdown relative inline-flex'>
									<button
										id='hs-dropdown-hover-event'
										type='button'
										className='hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 disabled:opacity-50 disabled:pointer-events-none'
									>
										<div
											className={
												'w-12 h-12 bg-[#E7E8EE] rounded-full flex items-center justify-center cursor-pointer'
											}
										>
											EJ
										</div>

										<div className='text-left'>
											<h4 className={'font-bold text-black'}>
												{fname} {lname}
											</h4>
											{/*<h5>{user.email}</h5>*/}
											<h5>
												{toTitleCase(role)} - {pharmacyName}
											</h5>
										</div>
										<div>
											<RiArrowDownSLine className='hs-dropdown-open:rotate-180 size-4' />
										</div>
									</button>

									<div
										className='hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-72 bg-white rounded-lg p-4 mt-1 divide-y divide-gray-200'
										aria-labelledby='hs-dropdown-with-title'
									>
										<div className='py-2 first:pt-0 last:pb-0'>
											<span className='block py-3 px-3 text-xs text-gray-400'>
												Account Settings
											</span>
											<a
												className='flex items-center gap-x-3.5 py-3 px-4 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100'
												href='/dashboard/change-password'
											>
												<RiLockPasswordLine className={'size-5'} />
												Change Password
											</a>

											<a
												className='flex items-center gap-x-3.5 py-3 px-4 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100'
												href='/logout'
												onClick={(e) => {
													e.preventDefault();
													logOut();
												}}
											>
												<RiDoorLockBoxLine className={'size-5'} />
												Logout
											</a>
										</div>
									</div>
								</div>

								{/*More Options*/}
							</div>
						</div>
					</div>
				</nav>
			</header>
		</>
	);
};

export default DashboardHeader;
