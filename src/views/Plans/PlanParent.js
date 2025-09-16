import React from 'react'

import PlanAdd from './PlanAdd'

const PlanParent = () => {
  return (
    <>
    <PlanProvider>
        <PlanAdd/>
    </PlanProvider>

    </>
  )
}

export default PlanParent