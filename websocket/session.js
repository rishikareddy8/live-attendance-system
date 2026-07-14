let activeSession = null

const getSession = () => activeSession

const setSession = (session) => {
    activeSession = session
}

module.exports = { getSession, setSession }