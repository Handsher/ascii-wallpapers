import { expect, test } from 'claude-code/testing'

test('/wallpaper honu sets the lagoon behind the chat, and the backdrop draws it within the limit', async ($, on) => {
  const sets: unknown[] = []
  on('command.register', () => ({ value: { command: 'wallpaper' } }))
  on('theme.set', (_, e) => { sets.push(e); return { value: { isDrawn: true } } as never })
  on('theme.clear', () => ({ value: undefined }) as never)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('store.get', () => ({ value: undefined }))
  on('store.set', () => ({ value: undefined }))
  on('ui.status', () => ({ value: undefined }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const res = await $.command.run({ command: 'wallpaper', args: 'honu' } as never)
  expect(JSON.stringify(res)).toContain('Honu Lagoon is on.')
  const set = sets.at(-1) as { backdrop: { scene: string; glass: { blur: number } }; overrideColorScheme: string; colors: object }
  expect(set.backdrop.scene).toBe('aw-honu-4')
  expect(set.backdrop.glass.blur).toBe(22)
  expect(set.overrideColorScheme).toBe('dark')

  const ui = await $.ui.mount({ plugin: 'ascii-wallpapers', component: 'Backdrop', requestId: 'b', surface: 'desktop', props: { scene: 'aw-honu-4', plugin: 'ascii-wallpapers', glass: false } })
  const svg = await ui.find({ type: 'Svg' })
  const source = String((svg as { props?: { source?: string } } | undefined)?.props?.source ?? '')
  expect(source.startsWith('<svg')).toBe(true)
  expect(source.length <= 131072).toBe(true)
  await ui.unmount()

  expect(JSON.stringify(await $.command.run({ command: 'wallpaper', args: 'off' } as never))).toContain('Wallpaper off.')
  expect(JSON.stringify(await $.command.run({ command: 'wallpaper', args: 'nope' } as never))).toContain('No wallpaper')
})
