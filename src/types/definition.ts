/**
 * Shared identity and ownership fields for content definitions.
 *
 * The fields are intentionally small: existing content may keep its legacy
 * aliases while new content can point to the owning organization directly.
 */
export type DefinitionOrganizationKind = 'sect' | 'clan' | 'court' | 'guild' | 'independent'

export interface DefinitionAffiliation {
  organizationKind: DefinitionOrganizationKind
  organizationId?: string
}

export interface ContentDefinition {
  id: string
  name: string
  icon?: string
  affiliation?: DefinitionAffiliation
}

export interface DefinitionSkillRefs {
  /** Canonical skill references for content definitions. */
  skillIds?: string[]
  /** @deprecated Use skillIds for new definitions. */
  skills?: string[]
}
