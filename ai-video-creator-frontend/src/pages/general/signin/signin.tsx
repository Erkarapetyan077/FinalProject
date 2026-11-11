import { Spinner } from '../../../isLoading/Spinner/Spinner'
import { useForm, type SubmitHandler } from 'react-hook-form'
import styles from '../signin/Signin.module.css'
import { Link, useNavigate } from 'react-router-dom'
import type { SigninFormValues } from '../../../helpers/helper'
import { useState } from 'react'
import { useAppDispatch } from '../../../app/hooks'
import { setToken } from '../../../features/auth/authSlice'
import { useLoginMutation } from '../../../features/auth/authApi'
import { getApiErrorMessage } from '../../../helpers/helper'



export const Signin = () => {


  const [error, setError] = useState("")
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [login, { isLoading }] = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>()

  const onSubmit: SubmitHandler<SigninFormValues> = async (data) => {
    setError('')
    try {
      const response = await login(data).unwrap()
      localStorage.setItem('authToken', response.data.token)
      dispatch(setToken(response.data.token))
      navigate('/me/dashboard')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to sign in. Please try again.'))
    }
  }

  return (
    <main className={styles.page}>
      <aside className={styles.info} aria-labelledby="info-title">
        <a className={styles.brand} href="/" aria-label="Frame home">
          <span className={styles.brandMark} aria-hidden="true">▶</span>
          <span>frame</span>
        </a>

        <div className={styles.infoBody}>
          <p className={styles.infoEyebrow}>VOICE → TEXT → VIDEO</p>
          <h2 id="info-title" className={styles.infoTitle}>Your next story is waiting.</h2>
          <p className={styles.infoText}>
            Sign in to continue turning your ideas into videos with Frame.
          </p>
        </div>

        <p className={styles.infoFooter}>Make something worth watching.</p>
      </aside>

      <section className={styles.formSide} aria-labelledby="signin-title">
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>WELCOME BACK</p>
            <h1 id="signin-title" className={styles.title}>Sign in to Frame</h1>
            <p className={styles.subtitle}>Pick up where your creativity left off.</p>
          </div>

          <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input
                className={styles.input}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', {
                  required: 'Enter your email address.',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                })}
              />
              {errors.email && <p className={styles.error} id="email-error" role="alert">{errors.email.message}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                className={styles.input}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password', { required: 'Enter your password.' })}
              />
              {errors.password && <p className={styles.error} id="password-error" role="alert">{errors.password.message}</p>}
            </div>

            <button className={styles.submit} type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading && <Spinner />}
              {isLoading ? 'Signing in…' : 'Sign in'}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.signinPrompt}>
            New to Frame? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
