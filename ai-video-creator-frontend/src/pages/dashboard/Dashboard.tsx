import { Link } from "react-router-dom";
import { useGetMeQuery } from "../../features/auth/authApi";
import { useListProjectQuery } from "../../features/projects/projectApi";
import { Spinner } from "../../isLoading/Spinner/Spinner";
import styles from "./Dashboard.module.css";

export function Dashboard() {
    const { data: profileData } = useGetMeQuery();
    const name = profileData?.data.user?.name?.trim();
    const { data, isLoading, isError } = useListProjectQuery({ page: 1, limit: 4 });
    const projects = data?.data.items ?? [];
    

    return (
        <section className={styles.card}>
            <h1>Dashboard</h1>
            <section className={styles.welcome} aria-labelledby="welcome-heading">
                <div className={styles.welcomeText}>
                    <h2 id="welcome-heading">Welcome back{name ? `, ${name}` : ""}</h2>
                    <p>Create, edit and manage your videos<br />all in one place.</p>
                    <Link className={styles.createLink} to="/me/create-video">
                        <span aria-hidden="true">＋</span> Create video
                    </Link>
                </div>
                <svg className={styles.welcomeArt} viewBox="0 0 200 160" fill="none" aria-hidden="true">
                    <rect x="38" y="53" width="126" height="88" rx="13" fill="#AE8AF8" />
                    <path d="m91 78 29 18a4 4 0 0 1 0 7l-29 18a4 4 0 0 1-6-3V81a4 4 0 0 1 6-3Z" fill="white" />
                    <g transform="rotate(-13 38 53)">
                        <rect x="38" y="27" width="126" height="27" rx="6" fill="#8B55F5" />
                        <path d="m57 28-14 25h16l14-25Zm34 0L77 53h16l14-25Zm34 0-14 25h16l14-25Zm33 0-14 25h14a6 6 0 0 0 6-6V33a6 6 0 0 0-6-5Z" fill="#F4EEFF" />
                    </g>
                </svg>
            </section>
            <h2>My projects</h2>
            {isLoading ? (
                <div role="status"><Spinner /> Loading projects…</div>
            ) : isError ? (
                <p role="alert">Could not load projects. Please try again.</p>
            ) : projects.length === 0 ? (
                <p>You have no projects yet.</p>
            ) : (
                <ul className={styles.projects}>
                    {projects.map((project) => (
                        <li key={project.id}>{project.title} — {project.status}</li>
                    ))}
                </ul>
            )}
        </section>
    );
}
