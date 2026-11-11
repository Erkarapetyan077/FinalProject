import { useForm } from 'react-hook-form'
import { useChangeNameMutation, useGetMeQuery, useChangePasswordMutation, useChangeAvatarMutation, useDeleteAvatarMutation } from '../features/auth/authApi'
import { Spinner } from '../isLoading/Spinner/Spinner'
import type { ChangePasswordRequest } from '../helpers/helper'
import styles from './Settings.module.css'
import { BASE } from '../helpers/constants'

type Name = { name: string }
export function Settings() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Name>();
    const { register: passwordRegister, handleSubmit: passwordhandleSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<ChangePasswordRequest>();
    const [changeName, { isLoading }] = useChangeNameMutation();
    const [uploadAvatar] = useChangeAvatarMutation();
    const [changePassword, { isLoading: Loading }] = useChangePasswordMutation();
    const [deleteAvatar] = useDeleteAvatarMutation()
    const { data, refetch } = useGetMeQuery();
    const avatarUrl = data?.data.user.avatarUrl;


    const reductName = async (data: Name) => {
        const result = await changeName(data);
        if (!result.error) {
            await refetch();
        }
        reset();
    }

    const reductPassword = async (data: ChangePasswordRequest) => {
        await changePassword(data);
        resetPassword();
    }

    const reductAvatar = async (file?: File) => {

        if (!file) return;
        const formData = new FormData();

        formData.append('avatar', file);

        const result = await uploadAvatar(formData);

        if (!result.error) {
            await refetch();
        }
    }

    const removeAvatar = async () => {

        const result = await deleteAvatar();

        if (!result.error) {
            await refetch();
        }

    }
    return <>

        <section className={styles.avatarSection}>
            <div className={styles.sectionHeading}><span className={styles.sectionIcon}>▧</span><div><h2>Profile photo</h2><p>Your profile photo is shown in the app.</p></div></div>
            <div className={styles.avatar}>
                {avatarUrl ? <img src={new URL(avatarUrl, BASE).href} alt="Avatar" /> : <span>{data?.data.user.name?.trim().charAt(0).toUpperCase()}</span>}
            </div>
            <div className={styles.avatarActions}>
                <label className={styles.editPhoto}>Change photo<input aria-label="Choose profile photo" type="file" accept="image/*" onChange={(e) => reductAvatar(e.target.files?.[0])} /></label>
                <button type="button" className={styles.deleteButton} onClick={removeAvatar}>Delete</button>
            </div>
        </section>

        <section className={styles.card}>
            <div className={styles.sectionHeading}><span className={styles.sectionIcon}>◎</span><div><h2>Display name</h2><p>The name shown in your account.</p></div></div>
            <form onSubmit={handleSubmit(reductName)} className={styles.form}>
                <div className={styles.field}><label htmlFor="account-name">Full name</label><input id="account-name" autoComplete="name" placeholder="Enter your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name', { required: 'Name is required.', validate: value => value.trim().length > 0 || 'Name is required.' })} />{errors.name && <p id="name-error" className={styles.error} role="alert">{errors.name.message}</p>}</div>
                <div className={styles.formFooter}><p className={styles.hint}>Your details help make Frame feel like you.</p><button className={styles.primary} disabled={isLoading} aria-busy={isLoading}>{isLoading && <Spinner />}{isLoading ? 'Saving…' : 'Save name'} <span>↗</span></button></div>
            </form>
        </section>
        <section className={styles.card}>
            <div className={styles.sectionHeading}><span className={styles.sectionIcon}>◇</span><div><h2>Change password</h2><p>Update your account password.</p></div><span className={styles.privateBadge}>Private & secure</span></div>
            <form onSubmit={passwordhandleSubmit(reductPassword)} className={styles.form}>
                <div className={styles.field}><label htmlFor="current-password">Current password</label><input id="current-password" type="password" autoComplete="current-password" placeholder="Enter your current password" aria-invalid={!!passwordErrors.currentPassword} aria-describedby={passwordErrors.currentPassword ? 'current-password-error' : undefined} {...passwordRegister('currentPassword', { required: 'Current password is required.' })} />{passwordErrors.currentPassword && <p id="current-password-error" className={styles.error} role="alert">{passwordErrors.currentPassword.message}</p>}</div>
                <div className={styles.field}><label htmlFor="new-password">New password</label><input id="new-password" type="password" autoComplete="new-password" placeholder="Enter your new password" aria-invalid={!!passwordErrors.newPassword} aria-describedby={passwordErrors.newPassword ? 'new-password-error' : undefined} {...passwordRegister('newPassword', { required: 'New password is required.', minLength: { value: 8, message: 'New password must be at least 8 characters.' } })} />{passwordErrors.newPassword && <p id="new-password-error" className={styles.error} role="alert">{passwordErrors.newPassword.message}</p>}</div>
                <div className={styles.formFooter}><p className={styles.hint}>Keep your password somewhere safe.</p><button className={styles.primary} disabled={Loading} aria-busy={Loading}>{Loading && <Spinner />}{Loading ? 'Saving…' : 'Save password'} <span>↗</span></button></div>
            </form>



        </section>
    </>
}
