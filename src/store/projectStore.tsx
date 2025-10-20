import React, { ReactNode } from 'react'

interface ProjectProviderProps {
  children: ReactNode
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  return <>{children}</>
}
