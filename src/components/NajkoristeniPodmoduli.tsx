import React, { useEffect, useMemo, useState } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { NajiskoisteniPodmoduliInterface } from '../interfaces/NajiskoristeniPodmoduliInterface';
import { Link } from "./LinkBase";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const chartTitleSx = () => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    fontSize: "1.5rem",
    fontWeight: "bold",
    paddingBottom: 4,
    color: '#32355c',
});

let labelData: string[] = [];

const transformData = (data: NajiskoisteniPodmoduliInterface[]) => {
    const groupedData = data.reduce((accumulator, entry: NajiskoisteniPodmoduliInterface) => {
        const modul = entry.nazivModul;
        const podmodul = entry.nazivPodModul;

        const label = `${modul}\n${podmodul}`;
        labelData.push(label);

        if (!accumulator[label]) {
            accumulator[label] = { count: 0 };
        }

        accumulator[label].count += entry.podModulIdCount;

        return accumulator;
    }, {} as { [modul: string]: { count: number } });

    return groupedData;
};

const NajkoristeniPodmoduli: React.FC = () => {
    const [data, setData] = useState<NajiskoisteniPodmoduliInterface[]>([]);
    const [filteredData, setFilteredData] = useState<NajiskoisteniPodmoduliInterface[]>([]);
    const [showModul, setShowModule] = useState<string>('default');

    useEffect(() => {
        fetch(`${Link}/api/DataStatistics/NajkoristeniPodmoduli`, {
            method: "get",
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                "ngrok-skip-browser-warning": "69420",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("Received content is not JSON");
                }
                return response.json();
            })
            .then((data: NajiskoisteniPodmoduliInterface[]) => {
                setData(data);
                setFilteredData(data);
            })
            .catch((err) => console.error('Error fetching data:', err));
    }, []);

    const transformedData = React.useMemo(() => transformData(filteredData), [filteredData]);

    const chartData = useMemo(() => {
        if (showModul === 'default') {
            return {
                labels: Object.keys(transformedData).map((modul) => modul),
                datasets: [{
                    data: Object.keys(transformedData).map((modul) => transformedData[modul].count),
                    backgroundColor: "rgb(41, 176, 190)",
                    minBarLength: 5,
                }],
            };
        } else {
            const filteredSubmodules = data.filter((entry: NajiskoisteniPodmoduliInterface) => entry.nazivModul === showModul).map((entry: NajiskoisteniPodmoduliInterface) => entry.nazivPodModul);
            return {
                labels: filteredSubmodules,
                datasets: [{
                    data: data.filter((entry: NajiskoisteniPodmoduliInterface) => entry.nazivModul === showModul).map((entry: NajiskoisteniPodmoduliInterface) => entry.podModulIdCount),
                    backgroundColor: "rgb(41, 176, 190)",
                    minBarLength: 5,
                }],
            };
        }
    }, [transformedData, showModul]);

    const options = useMemo(() => {
        const uniqueModules = new Set<string>();
        data.forEach((entry: NajiskoisteniPodmoduliInterface) => uniqueModules.add(entry.nazivModul));
        return Array.from(uniqueModules);
    }, [data]);

    const filterModule = () => {
        if (showModul === 'default') {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter((entry: NajiskoisteniPodmoduliInterface) => entry.nazivModul === showModul));
        }
    };

    useEffect(() => {
        filterModule();
    }, [showModul]);

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            // tooltip: {
            //     callbacks: {
            //         label: function (context) {
            //             let label = labelData[context.dataIndex];
            //             return label.split('\n');
            //         }
            //     }
            // }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Број на користења',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Модули и подмодули',
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                        size: 10,
                    },
                    callback: function (value: string | number) {
                        if (showModul === 'default') {
                            let label = labelData[value as number];
                            return label.split('\n');
                        } else {
                            return this.getLabelForValue(Number(value));
                        }
                    },
                },
            },
        },
    };

    return (
        <>
            <Typography component="label" variant="body2" sx={chartTitleSx()}>Најкористени подмодули</Typography>
            <Box>
                <FormControl>
                    <Select
                        className='select'
                        onChange={(event) => setShowModule(event.target.value)}
                        value={showModul}
                        sx={{ color: "#32355c", borderColor: "#32355c" }}
                    >
                        <MenuItem value="default" disabled>Прикажи модул</MenuItem>
                        {
                            options.map((option: string) => (
                                <MenuItem key={option} value={option} sx={{ color: "#32355c", borderColor: "#32355c" }}>{option}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                <Button onClick={() => setShowModule('default')} variant="contained" sx={{ marginLeft: 2, backgroundColor: 'rgb(41, 176, 190)', padding: '15px' }}>Приказ на сите модули</Button>
            </Box>
            <Bar
                data={chartData}
                options={chartOptions}
                height={200}
            />
        </>
    );
};

export default NajkoristeniPodmoduli;
