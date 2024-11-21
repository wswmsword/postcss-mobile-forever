export default function usePage() {
  const router = useRouter()

  function reload() {
    router.push({
      name: 'reload',
    })
  }

  return {
    reload,
  }
}
