import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  InputAdornment
} from '@mui/material'
import { Person, Email, Lock } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authAPI } from '../../services/api'

function Register() {
  const [step, setStep] = useState(0)
  const [otp, setOtp] = useState('')
  const [tempUser, setTempUser] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)
      return 'Please fill all fields'
    if (formData.password !== formData.confirmPassword)
      return 'Passwords do not match'
    return null
  }

  /* ========================
     STEP 1: SEND OTP
  ======================== */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')

    const err = validateForm()
    if (err) {
      setError(err)
      return
    }

    setLoading(true)
    try {
      await authAPI.sendOtp({ email: formData.email })
      setTempUser(formData)
      setStep(1)
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to send OTP'

      if (msg.toLowerCase().includes('already exists')) {
        setError('Account already exists. Redirecting to login...')
        setTimeout(() => navigate('/login'), 1500)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ========================
     STEP 2: VERIFY OTP + REGISTER
  ======================== */
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('OTP is required')
      return
    }

    if (!tempUser) {
      setError('Session expired. Please sign up again.')
      setStep(0)
      return
    }

    setLoading(true)
    setError('')

    try {
      await authAPI.verifyOtp({ email: tempUser.email, otp })

      const result = await register(
        tempUser.name,
        tempUser.email,
        tempUser.password
      )

      if (result.success) {
        navigate('/dashboard')
      } else {
        if (result.error?.toLowerCase().includes('exists')) {
          setError('Account already exists. Redirecting to login...')
          setTimeout(() => navigate('/login'), 1500)
        } else {
          setError(result.error)
        }
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Fade in>
        <Paper sx={{ p: 4, mt: 8 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* ========================
              STEP 1 UI
          ======================== */}
          {step === 0 && (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h4" mb={2}>Create Account</Typography>

              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} /> : 'Send OTP'}
              </Button>

              {/* ✅ SIGN IN LINK */}
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Already have an account?
                </Typography>
                <Button
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Sign in
                </Button>
              </Box>
            </Box>
          )}

          {/* ========================
              STEP 2 UI
          ======================== */}
          {step === 1 && (
            <Grow in>
              <Box>
                <Typography variant="h5" mb={2}>Verify Email</Typography>

                <TextField
                  fullWidth
                  label="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  margin="normal"
                />

                <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={22} /> : 'Verify OTP'}
                </Button>

                {/* ✅ SIGN IN LINK */}
                <Box textAlign="center" mt={2}>
                  <Typography variant="body2">
                    Already have an account?
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Sign in
                  </Button>
                </Box>
              </Box>
            </Grow>
          )}
        </Paper>
      </Fade>
    </Container>
  )
}

export default Register
