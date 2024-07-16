import { useEffect, useState } from 'react'
import { gamesSelected } from '../../../../store/store'

export default function RemoveButton() {
  const [isGamesSelected, setIsGamesSelected] = useState(false)

  useEffect(() => {
    const unsubscribe = gamesSelected.subscribe((value) => {
      console.log(value)

      setIsGamesSelected(!!value.length)
    })

    return unsubscribe
  }, [])

  const removeItem = () => {
    localStorage.removeItem('gameSelected')
    gamesSelected.set([])
  }

  return (
    <button
      disabled={!isGamesSelected}
      onClick={removeItem}
      style={{
        backgroundColor: '#ff0000',
        color: '#ffffff',
        borderRadius: '5px',
        padding: '10px 20px',
        cursor: 'pointer',
        fontSize: '16px',
        opacity: !isGamesSelected ? 0.5 : 1,
      }}
    >
      <div>
        <i className="fa fa-trash"></i>
      </div>
    </button>
  )
}
