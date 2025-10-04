'use client'

import { useState } from 'react'
import UserManualModal from './UserManualModal'

export default function HelpButton() {
  const [showManual, setShowManual] = useState(false)

  return (
    <>
      {/* Botón flotante de ayuda */}
      <button
        className="btn btn-primary rounded-circle position-fixed help-button-float"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          zIndex: 1050,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontSize: '24px',
          border: 'none'
        }}
        onClick={() => setShowManual(true)}
        title="Manual de Usuario - Haz clic para ver ayuda completa"
      >
        <i className="fas fa-question"></i>
      </button>

      {/* Modal del manual */}
      <UserManualModal 
        show={showManual} 
        onHide={() => setShowManual(false)} 
      />
    </>
  )
}