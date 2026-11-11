import { Link } from "react-router-dom";
import { useGetMeQuery } from "../../../features/auth/authApi";
import { BASE } from "../../../helpers/constants";
import styles from "./Accoutn.module.css";



export function Account() {
    const { data } = useGetMeQuery();

    const profile = data?.data.user;
    const email = profile?.email;
    const createdAt = profile?.createdAt;


    return (

        <section className={styles.identityCard}>
            <div className={styles.roundAvatar}>
                {profile?.avatarUrl ? <img src={new URL(profile.avatarUrl, BASE).href} alt="Avatar" /> : <span>{profile?.name?.trim().charAt(0).toUpperCase()}</span>}
            </div>
            <div className={styles.identityText}>
                <p className={styles.eyebrow}>YOUR PROFILE</p>
                <h2>{profile?.name}</h2>
                <p>Your personal creative space.</p>
                <Link className={styles.settingsLink} to="/me/settings">Go to settings <span aria-hidden="true">↗</span></Link>
            </div>
            <section className={styles.accountCard}>
                <dl className={styles.accountDetails}>
                    <div><span className={styles.detailIcon} aria-hidden="true">✉</span><div><dt>Email address</dt><dd>{email || '—'}</dd></div></div>
                    <div><span className={styles.detailIcon} aria-hidden="true">▦</span><div><dt>Member since</dt><dd>{createdAt ? new Date(createdAt).toLocaleDateString('hy-AM', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</dd></div></div>
                </dl>

            </section>


        </section>
    )
}
