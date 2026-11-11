import { useForm } from "react-hook-form"
import { getApiErrorMessage, type CreateProjectRequest } from "../../helpers/helper"
import { useCreateProjectsMutation } from "../../features/projects/projectApi"

import styles from "./CreateVideo.module.css";

export function CreateVideo() {

    const [createProject, { isLoading, isSuccess, error }] = useCreateProjectsMutation()
    const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectRequest>()


    const onSubmit = async (projectForm: CreateProjectRequest) => {
        await createProject(projectForm);
    };
    return (
        <div className={styles.card}>
            <h1 className={styles.heading}>Create a project</h1>
            <p className={styles.subtitle}>Give your video a title, choose a topic, and add your script.</p>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>

                {errors.title && <p className={styles.error}>{errors.title?.message}</p>}
                {errors.topic && <p className={styles.error}>{errors.topic?.message}</p>}
                {errors.scriptText && <p className={styles.error}>{errors.scriptText?.message}</p>}
                <label className={styles.label} htmlFor="project-title">Project title</label>
                <input id="project-title" className={styles.input} placeholder="e.g. A weekend in the mountains" {...register('title', {
                    required: 'Please enter a project title.'
                })} />
                <label className={styles.label} htmlFor="project-topic">Topic</label>
                <input id="project-topic" className={styles.input} placeholder="e.g. Travel, nature, or storytelling" {...register('topic', {
                    required: 'Please enter a topic.'
                })} />
                <label className={styles.label} htmlFor="project-script">Script</label>
                <input id="project-script" className={styles.input} placeholder="Write the narration for your video" {...register('scriptText', {
                    required: 'Please enter your video script.'
                })} />

                <button className={styles.submit} type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create project'}
                </button>
                {isSuccess && <p className={styles.success}>Your project is ready. Find it in Projects.</p>}
                {error && <p className={styles.error} role="alert">{getApiErrorMessage(error, "Could not create the project.")}</p>}

            </form>


        </div>
    )
}
