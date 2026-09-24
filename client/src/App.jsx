import { useEffect, useState } from 'react'
import './App.css'

const companies = ['HCLTech', 'TCS', 'Wipro', 'Infosys', 'Accenture', 'Cognizant', 'Deloitte', 'Capgemini', 'Microsoft', 'Amazon']
const initialForm = { name: '', age: '', rollNo: '', dateOfBirth: '', bloodGroup: '', phone: '', email: '', address: '', department: '', gender: '', year: '', section: '', arrears: '' }
const fieldGroups = [
  { title: 'Identity', fields: [['name', 'Full name', 'text'], ['rollNo', 'Roll number', 'text'], ['dateOfBirth', 'Date of birth', 'date'], ['age', 'Age', 'number'], ['gender', 'Gender', 'select', ['Select gender', 'Female', 'Male', 'Non-binary', 'Prefer not to say']], ['bloodGroup', 'Blood group', 'select', ['Select blood group', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']] ] },
  { title: 'Contact', fields: [['phone', 'Phone number', 'tel'], ['email', 'Email address', 'email'], ['address', 'Address', 'textarea']] },
  { title: 'Academic details', fields: [['department', 'Engineering course', 'select', ['Select department', 'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical & Electronics', 'Mechanical Engineering', 'Civil Engineering', 'Artificial Intelligence & Data Science']], ['year', 'Year', 'select', ['Select year', '1st year', '2nd year', '3rd year', '4th year']], ['section', 'Section', 'text'], ['arrears', 'No. of arrears', 'number']] },
]

function App() {
  const [view, setView] = useState('register')
  const [form, setForm] = useState(initialForm)
  const [students, setStudents] = useState([])
  const [currentStudent, setCurrentStudent] = useState(null)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetch(`${apiUrl}/api/students`)
      .then((response) => { if (!response.ok) throw new Error('Could not load registrations'); return response.json() })
      .then(setStudents)
      .catch(() => setSubmitError('Could not connect to the registration server.'))
  }, [apiUrl])
  const updateField = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: '' })) }
  const saveStudent = async (student) => {
    const response = await fetch(`${apiUrl}/api/students`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) })
    const savedStudent = await response.json()
    if (!response.ok) throw new Error(savedStudent.message || 'Could not save registration')
    setStudents((current) => [savedStudent, ...current])
  }
  const startCompanySelection = async (event) => {
    event.preventDefault()
    setSubmitError('')
    const nextErrors = {}
    Object.entries(form).forEach(([key, value]) => { if (!value) nextErrors[key] = 'Required' })
    if (form.arrears && Number(form.arrears) < 0) nextErrors.arrears = 'Cannot be negative'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (Number(form.arrears) !== 0) {
      try { await saveStudent({ ...form, companies: [] }); setForm(initialForm); setView('success') } catch (error) { setSubmitError(error.message) }
      return
    }
    setCurrentStudent({ ...form, id: Date.now() }); setSelectedCompanies([]); setView('companies')
  }
  const toggleCompany = (company) => setSelectedCompanies((current) => current.includes(company) ? current.filter((item) => item !== company) : current.length < 4 ? [...current, company] : current)
  const finishRegistration = async () => {
    if (selectedCompanies.length !== 4) return
    setSubmitError('')
    try { await saveStudent({ ...currentStudent, companies: selectedCompanies }); setForm(initialForm); setCurrentStudent(null); setView('success') } catch (error) { setSubmitError(error.message) }
  }
  const goTo = (nextView) => { setView(nextView); setErrors({}) }
  const groupedStudents = companies.map((company) => ({ company, students: students.filter((student) => student.companies.includes(company)) }))

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">SR</span><div><strong>Student Registry</strong><small>Campus placements portal</small></div></div><nav><button className={view === 'register' || view === 'companies' ? 'active' : ''} onClick={() => goTo('register')}>Register</button><button className={view === 'admin' ? 'active' : ''} onClick={() => goTo('admin')}>Admin view <span className="nav-count">{students.length}</span></button></nav></header>
      {view === 'register' && <section className="page"><div className="page-heading"><div><p className="eyebrow">Student intake · 2026</p><h1>Build your placement profile.</h1><p className="intro">Tell us about yourself. Students with zero arrears can shortlist four companies after submitting their details.</p></div><div className="stepper"><span className="current">01</span><i></i><span>02</span></div></div>{submitError && <p role="alert" className="submit-error">{submitError}</p>}<form className="form-card" onSubmit={startCompanySelection}>{fieldGroups.map((group) => <fieldset key={group.title}><legend>{group.title}</legend><div className="field-grid">{group.fields.map(([name, label, type, options]) => <label key={name} className={type === 'textarea' ? 'wide' : ''}>{label}{type === 'select' ? <select name={name} value={form[name]} onChange={updateField}>{options.map((option, index) => <option key={option} value={index === 0 ? '' : option}>{option}</option>)}</select> : type === 'textarea' ? <textarea name={name} value={form[name]} onChange={updateField} placeholder="House no., street, city" rows="3" /> : <input name={name} type={type} value={form[name]} onChange={updateField} placeholder={name === 'section' ? 'e.g. A' : ''} min={type === 'number' ? '0' : undefined} />}{errors[name] && <em>{errors[name]}</em>}</label>)}</div></fieldset>)}<div className="form-footer"><span><b>*</b> All fields are required</span><button className="primary" type="submit">Continue <span>→</span></button></div></form></section>}
      {view === 'companies' && <section className="page narrow"><div className="page-heading company-heading"><div><p className="eyebrow">Step 02 · Company preferences</p><h1>Choose your four.</h1><p className="intro">Select exactly four companies you would like to be considered for. You have picked <strong>{selectedCompanies.length} / 4</strong>.</p></div><div className="selection-ring">{selectedCompanies.length}<small>/4</small></div></div>{submitError && <p role="alert" className="submit-error">{submitError}</p>}<div className="company-grid">{companies.map((company, index) => <button type="button" key={company} className={`company-option ${selectedCompanies.includes(company) ? 'selected' : ''}`} onClick={() => toggleCompany(company)}><span className="company-number">{String(index + 1).padStart(2, '0')}</span><strong>{company}</strong><span className="check">{selectedCompanies.includes(company) ? '✓' : '+'}</span></button>)}</div><div className="company-actions"><button className="text-button" onClick={() => goTo('register')}>← Back to details</button><button className="primary" disabled={selectedCompanies.length !== 4} onClick={finishRegistration}>Submit registration <span>→</span></button></div></section>}
      {view === 'success' && <section className="success-page"><div className="success-icon">✓</div><p className="eyebrow">Registration received</p><h1>You are on the list.</h1><p>Your student profile has been saved successfully. The placement cell can now review your preferences.</p><div><button className="primary" onClick={() => goTo('register')}>Register another student <span>→</span></button><button className="text-button" onClick={() => goTo('admin')}>Open admin view</button></div></section>}
      {view === 'admin' && <section className="page admin-page"><div className="page-heading"><div><p className="eyebrow">Placement cell · Admin</p><h1>Registrations by company.</h1><p className="intro">A live overview of student preferences, grouped for quick review.</p></div><div className="total-stat"><strong>{students.length}</strong><span>total profiles</span></div></div><div className="admin-grid">{groupedStudents.map(({ company, students: companyStudents }) => <article className="company-column" key={company}><header><strong>{company}</strong><span>{companyStudents.length}</span></header>{companyStudents.length ? companyStudents.map((student) => <div className="student-row" key={student.id}><span className="avatar">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{student.name}</strong><small>{student.rollNo} · {student.department.split(' ')[0]}</small></div></div>) : <p className="empty">No preferences yet</p>}</article>)}</div></section>}
      <footer><span>Student Registry</span><span>Placement cell portal <b>•</b> {new Date().getFullYear()}</span></footer>
    </main>
  )
}

export default App
