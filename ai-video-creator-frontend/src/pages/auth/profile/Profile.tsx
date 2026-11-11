import { useGetMeQuery } from "../../../features/auth/authApi"
import { useAppSelector } from "../../../app/hooks";
import { Link, Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Spinner } from "../../../isLoading/Spinner/Spinner";
import styles from "./Profile.module.css";
import { BASE } from "../../../helpers/constants";

export function Profile() {
    const token = useAppSelector(store => store.auth.token)
    const { data, isLoading } = useGetMeQuery(undefined, { skip: !token })
    const navigate = useNavigate()
    if (!token) return <Navigate to="/login" replace />;
    if (isLoading) return <Spinner />;

    const profile = data?.data.user;




    const handleLogout = () => {

        localStorage.removeItem('authToken')
        navigate('/login')

    }



    return (
        <div className={styles.page}>
            <aside className={styles.sidebar}>
                <Link className={styles.brand} to="/me/dashboard"><span>▶</span>frame<i>.</i></Link>
                <div className={styles.sidebarUser}><div className={styles.roundAvatar}>{profile?.avatarUrl ? <img src={new URL(profile.avatarUrl, BASE).href} alt="Avatar" /> : <span>{profile?.name?.trim().charAt(0).toUpperCase()}</span>}</div><strong>{profile?.name}</strong></div>
                <nav className={styles.navigation} aria-label="Account navigation">
                    <NavLink to="/me/dashboard" end className={({ isActive }) => isActive ? styles.active : ""}><span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg></span>Dashboard</NavLink>
                    <NavLink to="/me/account" className={({ isActive }) => isActive ? styles.active : ""}><span>◎</span>My Account</NavLink>
                    <NavLink to="/me/create-video" className={({ isActive }) => isActive ? styles.active : ""}><span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-3v10l-4-3M7 12h6M10 9v6" /></svg></span>Create Video</NavLink>
                    <NavLink to="/me/projects" className={({ isActive }) => isActive ? styles.active : ""}><span aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path d="M3 8h18" /></svg></span>Projects</NavLink>
                    <NavLink to="/me/settings" className={({ isActive }) => isActive ? styles.active : ""}><span>⚙</span>Settings</NavLink>
                </nav>
                <button type="button" className={styles.logout} onClick={handleLogout}>Logout <span>↪</span></button>
            </aside>
            <main className={styles.main}>
                <header className={styles.topbar}><span>Workspace</span><Link to="/me/dashboard">Back to dashboard ↗</Link></header>
                <div className={styles.content}>
                    <p className={styles.eyebrow}>A SPACE THAT’S YOURS</p>
                    <p className={styles.subtitle}>Your details, your creative space.</p>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
