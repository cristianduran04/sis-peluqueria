import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Movements = () => {
  const [movements, setMovements] = useState([]);
  const [editId, setEditId] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const fetchMovements = async () => {
    try {
      const movementsSnapshot = await getDocs(collection(db, 'movements'));
      const movementList = movementsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate()
            : null,
        };
      });
      setMovements(movementList);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleDeleteMovement = async (id) => {
    try {
      await deleteDoc(doc(db, 'movements', id));
      fetchMovements(); // Refrescar la lista después de eliminar
    } catch (error) {
      console.error('Error deleting movement:', error);
    }
  };

  const handleEditMovement = async (movement) => {
    setEditId(movement.id);
    setAmount(movement.amount);
    setReason(movement.reason || ''); // Si no hay motivo, dejar vacío
  };

  const handleUpdateMovement = async () => {
    if (!amount || isNaN(amount)) {
      alert('Por favor, ingresa una cantidad válida.');
      return;
    }

    try {
      await updateDoc(doc(db, 'movements', editId), {
        amount: parseFloat(amount),
        reason: reason || null,
      });
      setEditId(null); // Resetear el ID de edición
      setAmount('');
      setReason('');
      fetchMovements(); // Refrescar la lista después de editar
    } catch (error) {
      console.error('Error updating movement:', error);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <div>
      <h2>Registro de Movimientos</h2>
      <ul>
        {movements.map(movement => (
          <li key={movement.id}>
            {movement.type === 'entrada' ? 'Entrada' : 'Salida'} - {movement.amount} $ 
            {movement.reason && ` (Motivo: ${movement.reason})`} 
            (Fecha: {movement.createdAt ? movement.createdAt.toDateString() : 'Fecha no disponible'})
            <button onClick={() => handleEditMovement(movement)}>Editar</button>
            <button onClick={() => handleDeleteMovement(movement.id)}>Eliminar</button>
          </li>
        ))}
      </ul>

      {editId && (
        <div>
          <h3>Editar Movimiento</h3>
          <input
            type="number"
            placeholder="Nueva Cantidad"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nuevo Motivo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button onClick={handleUpdateMovement}>Actualizar</button>
          <button onClick={() => setEditId(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Movements;
