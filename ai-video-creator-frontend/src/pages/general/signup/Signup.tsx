import { Spinner } from '../../../isLoading/Spinner/Spinner'
import { useRegisterMutation } from '../../../features/auth/authApi'
import { getApiErrorMessage } from '../../../helpers/helper'
import type { SignupFormValues } from '../../../helpers/helper'
import { useForm, type SubmitHandler } from 'react-hook-form'
import styles from './Signup.module.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const steps = [
  { icon: '🎙️', title: 'Speak your idea', text: 'Record or upload your voice. No script needed.' },
  { icon: '💬', title: 'Get the transcript', text: 'Frame turns your speech into clean, editable text.' },
  { icon: '🎥', title: 'Pick your video', text: 'Choose from generated video options and make it yours.' },
]

export const Signup = () => {

  const [error, setError] = useState("")
  const navigate = useNavigate()
  const [registerAccount, { isLoading }] = useRegisterMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>()

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setError('')
    try {
      await registerAccount(data).unwrap()
      navigate('/login')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create your account. Please try again.'))
    }
  }

  return (
    <main className={styles.page}>
      {/* ---------- LEFT: info ---------- */}
      <aside className={styles.info} aria-labelledby="info-title">
        <a className={styles.brand} href="/" aria-label="Frame home">
          <span className={styles.brandMark} aria-hidden="true">▶</span>
          <span>frame</span>
        </a>

        <div className={styles.infoBody}>
          <p className={styles.infoEyebrow}>VOICE → TEXT → VIDEO</p>
          <h2 id="info-title" className={styles.infoTitle}>
            Say it out loud.<br />Watch it come to life.
          </h2>
          <p className={styles.infoText}>
            Frame listens to your voice, turns it into text, and generates video
            options you can choose from in seconds.
          </p>

          <div className={styles.wave} aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
            ))}
          </div>

          <ol className={styles.steps}>
            {steps.map((step) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepIcon} aria-hidden="true">{step.icon}</span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.infoFooter}>Make something worth watching.</p>
      </aside>

      {/* ---------- RIGHT: registration ---------- */}
      <section className={styles.formSide} aria-labelledby="signup-title">
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>YOUR NEXT STORY STARTS HERE</p>
            <h1 id="signup-title" className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>Join Frame and turn your ideas into videos.</p>
          </div>

          <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full name</label>
              <input className={styles.input} id="name" type="text" autoComplete="name" placeholder="Your name"
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}
                {...register('name', { required: 'Enter your full name.', minLength: { value: 2, message: 'Name must be at least 2 characters.' } })} />
              {errors.name && <p className={styles.error} id="name-error" role="alert">{errors.name.message}</p>}
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input className={styles.input} id="email" type="email" autoComplete="email" placeholder="you@example.com"
                aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', { required: 'Enter your email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' } })} />
              {errors.email && <p className={styles.error} id="email-error" role="alert">{errors.email.message}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input className={styles.input} id="password" type="password" autoComplete="new-password" placeholder="At least 8 characters"
                aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                {...register('password', { required: 'Enter a password.', minLength: { value: 8, message: 'Password must be at least 8 characters.' } })} />
              {errors.password
                ? <p className={styles.error} id="password-error" role="alert">{errors.password.message}</p>
                : <p className={styles.hint} id="password-hint">Use at least 8 characters.</p>}
            </div>

            <button className={styles.submit} type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading && <Spinner />}
              {isLoading ? 'Creating account…' : 'Create account'}
              {!isLoading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.signinPrompt}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
