import { create } from 'zustand'

export interface Version {
  id: string
  timestamp: Date
  content: string
  description?: string
  changes?: Change[]
}

export interface Change {
  type: 'add' | 'delete' | 'modify'
  line: number
  content: string
  oldContent?: string
}

interface VersionControlState {
  versions: Version[]
  currentVersionId: string | null
  isTracking: boolean
  
  // Actions
  createVersion: (content: string, description?: string) => void
  revertToVersion: (versionId: string) => string | null
  getCurrentVersion: () => Version | null
  getVersionDiff: (fromVersionId: string, toVersionId: string) => Change[]
  getVersionChanges: (versionId: string) => DiffLine[] // 获取版本相对于前一个版本的变化
  startTracking: () => void
  stopTracking: () => void
  deleteVersion: (versionId: string) => void
}

// 改进的差异计算函数，支持全文显示
export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified'
  lineNumber: number
  content: string
  oldContent?: string
}

export function calculateFullDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const diffLines: DiffLine[] = []
  
  // 使用更智能的差异算法
  const maxLines = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === undefined && newLine !== undefined) {
      // 新增行
      diffLines.push({
        type: 'added',
        lineNumber: i + 1,
        content: newLine
      })
    } else if (newLine === undefined && oldLine !== undefined) {
      // 删除行
      diffLines.push({
        type: 'removed',
        lineNumber: i + 1,
        content: oldLine
      })
    } else if (oldLine === newLine) {
      // 相同行
      diffLines.push({
        type: 'unchanged',
        lineNumber: i + 1,
        content: oldLine
      })
    } else {
      // 修改行 - 显示两行
      diffLines.push({
        type: 'removed',
        lineNumber: i + 1,
        content: oldLine
      })
      diffLines.push({
        type: 'added',
        lineNumber: i + 1,
        content: newLine,
        oldContent: oldLine
      })
    }
  }
  
  return diffLines
}

// 保持原有的简单差异计算函数用于兼容
function calculateDiff(oldContent: string, newContent: string): Change[] {
  const diffLines = calculateFullDiff(oldContent, newContent)
  const changes: Change[] = []
  
  diffLines.forEach((line) => {
    if (line.type !== 'unchanged') {
      changes.push({
        type: line.type === 'added' ? 'add' : line.type === 'removed' ? 'delete' : 'modify',
        line: line.lineNumber,
        content: line.content,
        oldContent: line.oldContent
      })
    }
  })
  
  return changes
}

export const useVersionControlStore = create<VersionControlState>((set, get) => ({
  versions: [],
  currentVersionId: null,
  isTracking: false,

  createVersion: (content: string, description?: string) => {
    const state = get()
    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: new Date(),
      content,
      description: description || `版本 ${state.versions.length + 1}`,
      changes: []
    }

    // 如果有上一个版本，计算差异（新版本相对于前一个版本）
    if (state.versions.length > 0) {
      const previousVersion = state.versions[state.versions.length - 1]
      newVersion.changes = calculateDiff(previousVersion.content, content)
    }

    set({
      versions: [...state.versions, newVersion],
      currentVersionId: newVersion.id
    })
  },

  revertToVersion: (versionId: string) => {
    const state = get()
    const targetVersion = state.versions.find(v => v.id === versionId)
    if (targetVersion) {
      set({
        currentVersionId: versionId
      })
      return targetVersion.content
    }
    return null
  },

  getCurrentVersion: () => {
    const state = get()
    return state.versions.find(v => v.id === state.currentVersionId) || null
  },

  getVersionDiff: (fromVersionId: string, toVersionId: string) => {
    const state = get()
    const fromVersion = state.versions.find(v => v.id === fromVersionId)
    const toVersion = state.versions.find(v => v.id === toVersionId)
    
    if (!fromVersion || !toVersion) return []
    
    return calculateDiff(fromVersion.content, toVersion.content)
  },

  getVersionChanges: (versionId: string) => {
    const state = get()
    const version = state.versions.find(v => v.id === versionId)
    if (!version) return []
    
    // 找到当前版本在数组中的索引
    const versionIndex = state.versions.findIndex(v => v.id === versionId)
    
    // 如果是第一个版本，没有前一个版本可以比较
    if (versionIndex === 0) {
      return calculateFullDiff('', version.content)
    }
    
    // 与前一个版本比较
    const previousVersion = state.versions[versionIndex - 1]
    return calculateFullDiff(previousVersion.content, version.content)
  },

  startTracking: () => {
    const state = get()
    if (!state.isTracking) {
      set({ isTracking: true })
    }
  },

  stopTracking: () => {
    const state = get()
    if (state.isTracking) {
      set({ isTracking: false })
    }
  },

  deleteVersion: (versionId: string) => {
    const state = get()
    const newVersions = state.versions.filter(v => v.id !== versionId)
    
    // 如果删除的是当前版本，切换到最新版本
    let newCurrentVersionId = state.currentVersionId
    if (state.currentVersionId === versionId && newVersions.length > 0) {
      newCurrentVersionId = newVersions[newVersions.length - 1].id
    }
    
    set({
      versions: newVersions,
      currentVersionId: newVersions.length === 0 ? null : newCurrentVersionId
    })
  }
}))
