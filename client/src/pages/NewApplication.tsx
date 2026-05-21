import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, User, FileText, 
  Car, Shield, IndianRupee, Save 
} from 'lucide-react';
import '../pages.css';

export default function NewApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    customer: { mobile_1: '', full_name: '', email: '', address: '' },
    file: { service_type: 'Loan', reference_dealer_id: '', reference_broker_id: '' },
    vehicle: { vehicle_number: '', vehicle_model: '', manufacture_year: '' },
    finance: { loan_amount: '', bank_id: '', no_of_months: '' },
    insurance: { policy_number: '', insurance_company_id: '', premium_amount: '' },
    rto: { rto_district: '', rto_amount: '', service_requested: 'Transfer' }
  });

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    // Here is where you will make your Axios POST request to FastAPI
    console.log("Submitting to FastAPI:", formData);
    // alert('Application Submitted! Redirecting...');
    // navigate('/files');
  };

  // --- UI Components for Steps ---
  
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ margin: 0, color: 'var(--gray-900)' }}>Customer Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Mobile Number *</label>
          <input type="text" style={inputStyle} placeholder="+91" 
            value={formData.customer.mobile_1} 
            onChange={e => handleInputChange('customer', 'mobile_1', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input type="text" style={inputStyle} placeholder="John Doe" 
            value={formData.customer.full_name} 
            onChange={e => handleInputChange('customer', 'full_name', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input type="email" style={inputStyle} placeholder="john@example.com" 
            value={formData.customer.email} 
            onChange={e => handleInputChange('customer', 'email', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Residential Address</label>
          <input type="text" style={inputStyle} placeholder="House No, Street, City" 
            value={formData.customer.address} 
            onChange={e => handleInputChange('customer', 'address', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h3 style={{ margin: 0, color: 'var(--gray-900)' }}>File & Vehicle Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Service Type *</label>
          <select style={inputStyle} value={formData.file.service_type} 
            onChange={e => handleInputChange('file', 'service_type', e.target.value)}>
            <option value="Loan">Car Loan</option>
            <option value="Insurance">Insurance</option>
            <option value="RTO">RTO Services</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reference By (Optional)</label>
          <select style={inputStyle} value={formData.file.reference_dealer_id}
            onChange={e => handleInputChange('file', 'reference_dealer_id', e.target.value)}>
            <option value="">Select Dealer/Broker...</option>
            <option value="d1">Maruti Suzuki Anand</option>
            <option value="b1">Broker - Rahul</option>
          </select>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '10px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Vehicle Number</label>
          <input type="text" style={inputStyle} placeholder="GJ-23-XX-0000" 
            value={formData.vehicle.vehicle_number} 
            onChange={e => handleInputChange('vehicle', 'vehicle_number', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Vehicle Model</label>
          <input type="text" style={inputStyle} placeholder="Swift Dzire VXI" 
            value={formData.vehicle.vehicle_model} 
            onChange={e => handleInputChange('vehicle', 'vehicle_model', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Mfg. Year</label>
          <input type="number" style={inputStyle} placeholder="2020" 
            value={formData.vehicle.manufacture_year} 
            onChange={e => handleInputChange('vehicle', 'manufacture_year', e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const type = formData.file.service_type;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h3 style={{ margin: 0, color: 'var(--gray-900)' }}>
          {type} Details
        </h3>
        
        {type === 'Loan' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Bank Selection</label>
              <select style={inputStyle} value={formData.finance.bank_id} 
                onChange={e => handleInputChange('finance', 'bank_id', e.target.value)}>
                <option value="">Select Bank...</option>
                <option value="b1">HDFC Bank</option>
                <option value="b2">ICICI Bank</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Loan Amount (₹)</label>
              <input type="number" style={inputStyle} placeholder="500000" 
                value={formData.finance.loan_amount} 
                onChange={e => handleInputChange('finance', 'loan_amount', e.target.value)} />
            </div>
          </div>
        )}

        {type === 'Insurance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>Insurance Company</label>
              <select style={inputStyle} value={formData.insurance.insurance_company_id} 
                onChange={e => handleInputChange('insurance', 'insurance_company_id', e.target.value)}>
                <option value="">Select Company...</option>
                <option value="i1">New India Assurance</option>
                <option value="i2">ICICI Lombard</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Premium Amount (₹)</label>
              <input type="number" style={inputStyle} placeholder="15000" 
                value={formData.insurance.premium_amount} 
                onChange={e => handleInputChange('insurance', 'premium_amount', e.target.value)} />
            </div>
          </div>
        )}

        {type === 'RTO' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={labelStyle}>RTO District</label>
              <input type="text" style={inputStyle} placeholder="Anand (GJ-23)" 
                value={formData.rto.rto_district} 
                onChange={e => handleInputChange('rto', 'rto_district', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>RTO Amount (₹)</label>
              <input type="number" style={inputStyle} placeholder="2500" 
                value={formData.rto.rto_amount} 
                onChange={e => handleInputChange('rto', 'rto_amount', e.target.value)} />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} style={iconBtnStyle}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>New Application</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', margin: 0 }}>Create a new file and assign services.</p>
        </div>
      </div>

      {/* Stepper Progress */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {[
          { num: 1, label: 'Customer', icon: User },
          { num: 2, label: 'File & Vehicle', icon: Car },
          { num: 3, label: 'Specifics', icon: FileText }
        ].map((s) => (
          <div key={s.num} style={{ 
            flex: 1, padding: '12px 16px', borderRadius: 8, 
            background: step >= s.num ? 'var(--brand-50)' : 'var(--surface-0)',
            border: `1px solid ${step >= s.num ? 'var(--brand-200)' : 'var(--gray-200)'}`,
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: step < s.num ? 0.6 : 1
          }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: '50%', 
              background: step > s.num ? 'var(--brand-600)' : step === s.num ? 'var(--brand-100)' : 'var(--gray-100)',
              color: step > s.num ? '#fff' : step === s.num ? 'var(--brand-600)' : 'var(--gray-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
            }}>
              {step > s.num ? <CheckCircle2 size={14} /> : s.num}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: step >= s.num ? 'var(--brand-700)' : 'var(--gray-500)' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: 32, minHeight: 400 }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Action Footer */}
        <div style={{ 
          marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--gray-100)',
          display: 'flex', justifyContent: 'space-between' 
        }}>
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            style={{ ...btnStyle, opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? 'none' : 'auto' }}
          >
            Back
          </button>
          
          {step < 3 ? (
            <button onClick={() => setStep(s => Math.min(3, s + 1))} style={primaryBtnStyle}>
              Next Step
            </button>
          ) : (
            <button onClick={handleSubmit} style={{ ...primaryBtnStyle, background: '#10b981', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}>
              <Save size={16} /> Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Inline Styles (Move to CSS later) ---
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' as const };
const iconBtnStyle = { width: 40, height: 40, borderRadius: 10, background: 'var(--surface-0)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const btnStyle = { padding: '10px 20px', borderRadius: 8, background: 'var(--surface-0)', border: '1px solid var(--gray-200)', color: 'var(--gray-700)', fontWeight: 600, cursor: 'pointer' };
const primaryBtnStyle = { padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };