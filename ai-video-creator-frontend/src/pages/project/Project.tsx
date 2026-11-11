import { useState } from "react";
import { useListProjectQuery } from "../../features/projects/projectApi";
import { Spinner } from "../../isLoading/Spinner/Spinner";
import styles from "./Project.module.css";

export function Project() {
    const [page, setPage] = useState(1);
    const {data, isFetching, isError } = useListProjectQuery({ page, limit: 12 });
    const projects = data?.data.items ?? [];
    const totalPages = data?.data.pagination.totalPages ?? 1;

    return (
        <section className={styles.card}>
            <h1>Projects</h1>
            {isFetching && !data ? (
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
            {(page > 1 || totalPages > 1) && (
                <nav className={styles.pagination} aria-label="Projects pagination">
                    <button type="button" disabled={page === 1 || isFetching} onClick={() => setPage((previous) => previous - 1)}>
                        Previous
                    </button>
                    <span aria-live="polite">Page {page}{data ? ` of ${totalPages}` : ""}</span>
                    <button type="button" disabled={!data || page >= totalPages || isFetching} onClick={() => setPage((previous) => previous + 1)}>
                        Next
                    </button>
                </nav>
            )}
        </section>
    );
}
