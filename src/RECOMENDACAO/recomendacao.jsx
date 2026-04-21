import { useState, useEffect } from 'react';
import styles from './recomendacao.module.css';

export default function Recomendacao() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [editingCell, setEditingCell] = useState(null);
    const [changedRows, setChangedRows] = useState(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [filters, setFilters] = useState({
        ZONA: '',
        BOLETIM: '',
        DATA: '',
        RECOMENDACAO: ''
    });

    const API_URL = import.meta.env.VITE_CONSULTA_RECOMENDACAO;
    const EDIT_SINGLE_URL = import.meta.env.VITE_EDITA_RECOMENDACAO_ZONA;
    const EDIT_MULTIPLE_URL = import.meta.env.VITE_EDITA_MULTIPLOS_RECOMENDACAO_ZONA;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erro ao carregar dados');
            const result = await response.json();
            const dataArray = Array.isArray(result) ? result : result.dados || result.data || [];
            setData(dataArray);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRowSelection = (index) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllRows = () => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((_, i) => i)));
        }
    };

    const handleCellChange = (index, field, value) => {
        const rowKey = `${index}`;
        const changedRow = changedRows.get(rowKey) || { ...data[index] };
        changedRow[field] = value;
        
        const newChangedRows = new Map(changedRows);
        newChangedRows.set(rowKey, changedRow);
        setChangedRows(newChangedRows);

        const newData = [...data];
        newData[index] = changedRow;
        setData(newData);
    };

    const saveSingleRow = async (index) => {
        try {
            setIsSaving(true);
            const row = data[index];
            const zona = row.ZONA.trim();
            
            const response = await fetch(`${EDIT_SINGLE_URL}${zona}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    RECOMENDACAO: row.RECOMENDACAO,
                    DATA: row.DATA
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar');
            
            const newChangedRows = new Map(changedRows);
            newChangedRows.delete(`${index}`);
            setChangedRows(newChangedRows);
            
            await fetchData();
        } catch (err) {
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const saveMultipleRows = async () => {
        if (selectedRows.size === 0) {
            alert('Selecione pelo menos uma linha para salvar');
            return;
        }

        try {
            setIsSaving(true);
            const zonas = Array.from(selectedRows).map(i => data[i].ZONA);
            
            // Pega os dados da primeira linha selecionada como referência
            const firstIndex = Array.from(selectedRows)[0];
            const firstRow = data[firstIndex];

            const response = await fetch(EDIT_MULTIPLE_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zonas: zonas,
                    campos: {
                        RECOMENDACAO: firstRow.RECOMENDACAO,
                        DATA: firstRow.DATA
                    }
                })
            });

            if (!response.ok) throw new Error('Erro ao salvar');

            setChangedRows(new Map());
            setSelectedRows(new Set());
            await fetchData();
        } catch (err) {
            alert('Erro ao salvar múltiplas linhas: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const discardChanges = () => {
        if (changedRows.size > 0 && !confirm('Descartar alterações?')) return;
        setChangedRows(new Map());
        fetchData();
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getFilteredData = () => {
        return data.filter(row => {
            return Object.entries(filters).every(([field, filterValue]) => {
                if (!filterValue) return true;
                const rowValue = String(row[field] || '').toLowerCase();
                return rowValue.includes(filterValue.toLowerCase());
            });
        });
    };

    const filteredData = getFilteredData();

    if (loading) return <div className={styles.container}><p>Carregando...</p></div>;
    if (error) return <div className={styles.container}><p className={styles.error}>Erro: {error}</p></div>;

    return (
        <div className={styles.container}>
            <h2>Recomendações</h2>
            <p>Edite as recomendações e datas conforme necessário</p>

            <div className={styles.toolbar}>
                <button 
                    onClick={fetchData}
                    disabled={isSaving}
                    className={styles.btnSecondary}
                >
                    Recarregar
                </button>
                <button 
                    onClick={discardChanges}
                    disabled={isSaving || changedRows.size === 0}
                    className={styles.btnSecondary}
                >
                    Descartar Alterações
                </button>
                <button 
                    onClick={saveMultipleRows}
                    disabled={isSaving || selectedRows.size === 0}
                    className={styles.btnPrimary}
                >
                    Salvar Selecionados ({selectedRows.size})
                </button>
                <button 
                    onClick={() => setFilters({ ZONA: '', BOLETIM: '', DATA: '', RECOMENDACAO: '' })}
                    className={styles.btnSecondary}
                >
                    Limpar Filtros
                </button>
            </div>

            <div className={styles.filterRow}>
                <input
                    type="text"
                    placeholder="Filtrar Zona..."
                    value={filters.ZONA}
                    onChange={(e) => handleFilterChange('ZONA', e.target.value)}
                    className={styles.filterInput}
                />
                <input
                    type="text"
                    placeholder="Filtrar Boletim..."
                    value={filters.BOLETIM}
                    onChange={(e) => handleFilterChange('BOLETIM', e.target.value)}
                    className={styles.filterInput}
                />
                <input
                    type="text"
                    placeholder="Filtrar Data..."
                    value={filters.DATA}
                    onChange={(e) => handleFilterChange('DATA', e.target.value)}
                    className={styles.filterInput}
                />
                <input
                    type="text"
                    placeholder="Filtrar Recomendação..."
                    value={filters.RECOMENDACAO}
                    onChange={(e) => handleFilterChange('RECOMENDACAO', e.target.value)}
                    className={styles.filterInput}
                />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>
                                <input 
                                    type="checkbox" 
                                    checked={selectedRows.size === data.length && data.length > 0}
                                    onChange={toggleAllRows}
                                    disabled={isSaving}
                                />
                            </th>
                            <th>Zona</th>
                            <th>Boletim</th>
                            <th>Data</th>
                            <th>Recomendação</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row, index) => {
                            const isChanged = changedRows.has(`${index}`);
                            const isSelected = selectedRows.has(index);
                            return (
                                <tr 
                                    key={index} 
                                    className={`${isChanged ? styles.rowChanged : ''} ${isSelected ? styles.rowSelected : ''}`}
                                >
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={isSelected}
                                            onChange={() => toggleRowSelection(index)}
                                            disabled={isSaving}
                                        />
                                    </td>
                                    <td className={styles.cellReadonly}>{row.ZONA}</td>
                                    <td className={styles.cellReadonly}>{row.BOLETIM}</td>
                                    <td 
                                        className={styles.cellEditable}
                                        onClick={() => setEditingCell(`${index}-DATA`)}
                                    >
                                        {editingCell === `${index}-DATA` ? (
                                            <input 
                                                type="date"
                                                value={row.DATA || ''}
                                                onChange={(e) => handleCellChange(index, 'DATA', e.target.value)}
                                                autoFocus
                                                onBlur={() => setEditingCell(null)}
                                                className={styles.editInput}
                                            />
                                        ) : (
                                            <span>{row.DATA}</span>
                                        )}
                                    </td>
                                    <td 
                                        className={styles.cellEditable}
                                        onClick={() => setEditingCell(`${index}-RECOMENDACAO`)}
                                    >
                                        {editingCell === `${index}-RECOMENDACAO` ? (
                                            <textarea 
                                                value={row.RECOMENDACAO || ''}
                                                onChange={(e) => handleCellChange(index, 'RECOMENDACAO', e.target.value)}
                                                autoFocus
                                                onBlur={() => setEditingCell(null)}
                                                className={styles.editTextarea}
                                            />
                                        ) : (
                                            <span>{row.RECOMENDACAO}</span>
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => saveSingleRow(index)}
                                            disabled={!isChanged || isSaving}
                                            className={styles.btnSmall}
                                        >
                                            Salvar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <p className={styles.empty}>Nenhuma recomendação encontrada</p>
            )}
        </div>
    );
}