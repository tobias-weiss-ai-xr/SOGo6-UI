import reducer, { addAttachment, setPendingInsert } from '../mail-compose-slice'

const createTestDraft = (draftId: string) => ({
  draftId,
  mailKey: null,
  to: [] as { name?: string; email: string }[],
  cc: [] as { name?: string; email: string }[],
  bcc: [] as { name?: string; email: string }[],
  subject: '',
  body: '',
  attachments: [] as any[],
  priority: 2 as const,
  requestReadReceipt: false,
  signMessage: false,
  encryptMessage: false,
  isPlainText: false,
  isDirty: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  selectedSignatureKey: null,
  sendAt: null,
})

const createTestState = (draftId: string) => ({
  drafts: { [draftId]: createTestDraft(draftId) },
  activeDraftId: draftId,
  openDraftIds: [draftId],
  isSending: false,
  sendError: null,
  pendingInsert: null,
})

describe('mailComposeSlice', () => {
  describe('pendingInsert', () => {
    it('should have pendingInsert as null in initial state', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.pendingInsert).toBeNull()
    })

    it('should set pendingInsert when setPendingInsert is dispatched with a string', () => {
      const state = reducer(undefined, setPendingInsert('hello'))
      expect(state.pendingInsert).toBe('hello')
    })

    it('should reset pendingInsert to null when setPendingInsert(null) is dispatched', () => {
      const stateWithValue = reducer(undefined, setPendingInsert('hello'))
      const stateReset = reducer(stateWithValue, setPendingInsert(null))
      expect(stateReset.pendingInsert).toBeNull()
    })

    it('should set pendingInsert to an HTML string', () => {
      const html =
        '<a href="https://meet.jitsi.si/abc">https://meet.jitsi.si/abc</a>'
      const state = reducer(undefined, setPendingInsert(html))
      expect(state.pendingInsert).toBe(html)
    })
  })

  describe('addAttachment', () => {
    it('should have empty attachments array in initial state', () => {
      const state = reducer(undefined, { type: '@@INIT' })
      expect(state.drafts).toEqual({})
    })

    it('should add a local file attachment to draft', () => {
      const draftId = 'test-draft'
      const draft = createTestDraft(draftId)
      const initialState = createTestState(draftId)

      const attachment = {
        draftId: 'att-1',
        name: 'test.pdf',
        size: 1024,
        type: 'application/pdf',
        uploadStatus: 'completed' as const,
      }

      const state = reducer(
        initialState,
        addAttachment({ draftId, attachment })
      )
      expect(state.drafts[draftId].attachments).toHaveLength(1)
      expect(state.drafts[draftId].attachments[0].name).toBe('test.pdf')
    })

    it('should add a cloud file attachment from OpenCloud', () => {
      const draftId = 'test-draft'
      const draft = createTestDraft(draftId)
      const initialState = createTestState(draftId)

      const cloudAttachment = {
        draftId: 'att-cloud-1',
        name: 'document.docx',
        size: 0,
        type: 'application/octet-stream',
        share_url: 'https://opendesk-opencloud.example.com/share/abc123',
        cloud_source: 'OpenCloud',
        cloud_action: 'attach',
        uploadStatus: 'completed' as const,
      }

      const state = reducer(
        initialState,
        addAttachment({ draftId, attachment: cloudAttachment })
      )
      expect(state.drafts[draftId].attachments).toHaveLength(1)
      const addedAttachment = state.drafts[draftId].attachments[0]
      expect(addedAttachment.name).toBe('document.docx')
      expect(addedAttachment.share_url).toBe(
        'https://opendesk-opencloud.example.com/share/abc123'
      )
      expect(addedAttachment.cloud_source).toBe('OpenCloud')
      expect(addedAttachment.cloud_action).toBe('attach')
      expect(addedAttachment.uploadStatus).toBe('completed')
    })

    it('should handle multiple attachments on a draft', () => {
      const draftId = 'test-draft'
      const draft = createTestDraft(draftId)
      const stateWithDraft = createTestState(draftId)

      // Add first attachment (local)
      const localAttachment = {
        draftId: 'att-1',
        name: 'file1.txt',
        size: 100,
        type: 'text/plain',
        uploadStatus: 'completed' as const,
      }
      const stateAfterFirst = reducer(
        stateWithDraft,
        addAttachment({ draftId, attachment: localAttachment })
      )
      expect(stateAfterFirst.drafts[draftId].attachments).toHaveLength(1)

      // Add second attachment (cloud)
      const cloudAttachment = {
        draftId: 'att-2',
        name: 'file2.pdf',
        size: 0,
        type: 'application/octet-stream',
        share_url: 'https://opendesk-opencloud.example.com/share/xyz789',
        cloud_source: 'OpenCloud',
        cloud_action: 'share',
        uploadStatus: 'completed' as const,
      }
      const stateAfterSecond = reducer(
        stateAfterFirst,
        addAttachment({ draftId, attachment: cloudAttachment })
      )
      expect(stateAfterSecond.drafts[draftId].attachments).toHaveLength(2)
      expect(stateAfterSecond.drafts[draftId].attachments[0].name).toBe(
        'file1.txt'
      )
      expect(stateAfterSecond.drafts[draftId].attachments[1].name).toBe(
        'file2.pdf'
      )
      expect(stateAfterSecond.drafts[draftId].attachments[1].cloud_source).toBe(
        'OpenCloud'
      )
    })
  })
})
